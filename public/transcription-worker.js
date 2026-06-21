// transcription-worker.js
// Runs Transformers.js Whisper entirely off the main thread.
// Receives:  { type: 'transcribe', audioBuffer: ArrayBuffer, sampleRate: number }
// Posts back: { type: 'progress', percent: number, message: string }
//             { type: 'complete', transcript: Array<{start,end,text}> }
//             { type: 'error',    message: string }

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Never attempt to load from a local model directory — CDN only.
env.allowLocalModels = false;

// Reuse the pipeline across calls so the model is only downloaded once.
let transcriber = null;

function post(msg) {
  self.postMessage(msg);
}

function progress(percent, message) {
  post({ type: 'progress', percent, message });
}

// Decode raw PCM ArrayBuffer to 16 kHz mono Float32Array using OffscreenCanvas-free
// approach: the worker has no AudioContext, so we implement a basic resampler.
// For most formats (WAV already 16kHz mono) this is a no-op copy.
// For anything else we do a naive linear interpolation downsample.
function resampleTo16kHz(inputBuffer, inputSampleRate) {
  if (inputSampleRate === 16000) return inputBuffer;

  const ratio = inputSampleRate / 16000;
  const outputLength = Math.round(inputBuffer.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const src = i * ratio;
    const lo  = Math.floor(src);
    const hi  = Math.min(lo + 1, inputBuffer.length - 1);
    const t   = src - lo;
    output[i] = inputBuffer[lo] * (1 - t) + inputBuffer[hi] * t;
  }

  return output;
}

// Minimal WAV parser: returns { sampleRate, channelData: Float32Array }
// Handles PCM (format 1) and IEEE float (format 3), mono or stereo.
// Falls back to treating raw bytes as 16kHz mono float32 on failure.
function decodeWav(buffer) {
  const view = new DataView(buffer);
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riff !== 'RIFF') throw new Error('Not a WAV file');

  const sampleRate  = view.getUint32(24, true);
  const numChannels = view.getUint16(22, true);
  const bitsPerSample = view.getUint16(34, true);
  const audioFormat = view.getUint16(20, true); // 1=PCM, 3=IEEE float

  // Find 'data' chunk
  let dataOffset = 44;
  for (let i = 12; i < buffer.byteLength - 8; i++) {
    if (
      view.getUint8(i)     === 100 && // 'd'
      view.getUint8(i + 1) === 97  && // 'a'
      view.getUint8(i + 2) === 116 && // 't'
      view.getUint8(i + 3) === 97     // 'a'
    ) {
      dataOffset = i + 8;
      break;
    }
  }

  const bytesPerSample = bitsPerSample / 8;
  const totalSamples   = (buffer.byteLength - dataOffset) / bytesPerSample;
  const framesPerChannel = Math.floor(totalSamples / numChannels);
  const mono = new Float32Array(framesPerChannel);

  for (let i = 0; i < framesPerChannel; i++) {
    let sum = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      const bytePos = dataOffset + (i * numChannels + ch) * bytesPerSample;
      if (audioFormat === 3 && bitsPerSample === 32) {
        sum += view.getFloat32(bytePos, true);
      } else if (bitsPerSample === 16) {
        sum += view.getInt16(bytePos, true) / 32768;
      } else if (bitsPerSample === 8) {
        sum += (view.getUint8(bytePos) - 128) / 128;
      } else if (bitsPerSample === 32 && audioFormat === 1) {
        sum += view.getInt32(bytePos, true) / 2147483648;
      }
    }
    mono[i] = sum / numChannels;
  }

  return { sampleRate, channelData: mono };
}

self.addEventListener('message', async (event) => {
  const {
    type,
    audioBuffer,
    sampleRate: inputSampleRate,
    timeOffset  = 0, // seconds to add to all returned timestamps (for chunked mode)
    chunkIndex  = 0,
    totalChunks = 1,
  } = event.data;
  if (type !== 'transcribe') return;

  try {
    // --- Step 1: Load or reuse the pipeline ---
    if (!transcriber) {
      progress(5, 'Loading AI model…');

      transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        {
          progress_callback: (info) => {
            if (info.status === 'downloading' && info.total > 0) {
              const dlPct = Math.round((info.loaded / info.total) * 45);
              progress(10 + dlPct, `Downloading model: ${Math.round((info.loaded / info.total) * 100)}%`);
            } else if (info.status === 'initiate') {
              progress(10, 'Initialising model…');
            } else if (info.status === 'loading') {
              progress(55, 'Loading model weights…');
            } else if (info.status === 'ready') {
              progress(60, 'Model ready.');
            }
          },
        }
      );
    } else {
      progress(60, 'Model already loaded.');
    }

    // --- Step 2: Decode audio in the worker ---
    progress(62, 'Decoding audio…');

    let channelData;
    let sourceSampleRate = inputSampleRate || 44100;

    // Try WAV fast-path first; otherwise let Transformers.js handle decoding
    // by passing the raw ArrayBuffer directly (it supports MP3/OGG/WAV internally
    // when compiled with ffmpeg.wasm, but whisper-tiny.en expects Float32Array).
    // We receive a pre-decoded Float32Array from the main thread when possible,
    // or fall back to WAV parsing here.
    if (audioBuffer instanceof ArrayBuffer) {
      const header = new Uint8Array(audioBuffer, 0, 4);
      const isWav  = header[0] === 82 && header[1] === 73 && header[2] === 70 && header[3] === 70; // RIFF
      if (isWav) {
        const decoded = decodeWav(audioBuffer);
        channelData    = decoded.channelData;
        sourceSampleRate = decoded.sampleRate;
      } else {
        // Non-WAV: the main thread should send Float32Array; this path is a fallback.
        // Treat as raw 32-bit IEEE float at whatever sampleRate was supplied.
        channelData = new Float32Array(audioBuffer);
      }
    } else if (audioBuffer instanceof Float32Array) {
      channelData = audioBuffer;
    } else {
      throw new Error('Unsupported audio data type sent to worker.');
    }

    // Resample to 16 kHz (Whisper's required sample rate)
    progress(65, 'Resampling to 16 kHz…');
    const audio16k = resampleTo16kHz(channelData, sourceSampleRate);

    // --- Step 3: Transcribe ---
    progress(68, 'Transcribing audio…');

    // chunk_callback fires after each internal Whisper window completes.
    // For VAD chunks (~25–35s) this fires once per chunk; for any longer
    // fallback input it fires multiple times with accurate elapsed tracking.
    const audioDuration = audio16k.length / 16000;
    let   windowsDone   = 0;
    const windowSec     = 30; // matches chunk_length_s

    const result = await transcriber(audio16k, {
      return_timestamps: true,
      chunk_length_s:    30,
      stride_length_s:   5,
      chunk_callback: () => {
        windowsDone++;
        const elapsed = Math.min(windowsDone * windowSec, audioDuration);
        const pct     = Math.min(97, Math.round(68 + (elapsed / audioDuration) * 29));
        progress(pct, `Transcribing… (${Math.round(elapsed)}s / ${Math.round(audioDuration)}s)`);
      },
    });

    progress(98, 'Finalising…');

    // result.chunks is the authoritative stitched output for this outer chunk.
    // Use it as the 'complete' payload so the main thread can reconcile any
    // overlap corrections the library made after all windows were processed.
    const chunks = result.chunks || [
      { timestamp: [0, 0], text: result.text || '' },
    ];

    const transcript = chunks
      .map((c) => ({
        start: (c.timestamp?.[0] ?? 0) + timeOffset,
        end:   (c.timestamp?.[1] ?? 0) + timeOffset,
        text:  (c.text || '').trim(),
      }))
      .filter((d) => d.text.length > 0);

    progress(100, 'Done!');
    post({ type: 'complete', transcript, chunkIndex, totalChunks });

  } catch (err) {
    // Reset transcriber so next attempt re-initialises cleanly
    transcriber = null;
    post({ type: 'error', message: err?.message || 'Unknown transcription error.' });
  }
});
