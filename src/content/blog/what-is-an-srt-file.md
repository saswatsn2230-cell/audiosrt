---
title: "What Is an SRT File and How Does It Work?"
slug: "what-is-an-srt-file"
description: "Everything you need to know about SRT files: what they are, how the format works, where they're used, and how to create one for free."
pubDate: "2026-02-12"
---

# What Is an SRT File and How Does It Work?

If you've ever downloaded a video from the internet and noticed a separate text file with a `.srt` extension in the same folder, you've encountered an SRT file. Or maybe a video editor asked you to provide subtitles "as an SRT" and you weren't sure what that meant. This guide explains everything.

## SRT File Definition

SRT stands for **SubRip Subtitle**. It's a plain text file format for storing subtitle (caption) data — specifically, the text of what is spoken or described in a video, along with precise timecodes that tell video players when to display each line.

The format was originally created by a software program called SubRip, which "ripped" subtitles from DVDs. Today SRT is the most widely used subtitle format in the world, supported by virtually every video player, editing platform, and streaming service.

## What Does an SRT File Look Like?

Open any SRT file in a text editor (Notepad, TextEdit, VS Code) and you'll see something like this:

```
1
00:00:00,500 --> 00:00:04,000
Welcome to this tutorial on creating subtitles.

2
00:00:04,200 --> 00:00:08,750
Today, we'll learn everything about the SRT file format.

3
00:00:09,000 --> 00:00:13,500
It's simpler than you might expect — let's dive in.
```

Each subtitle block has exactly three components:

### 1. Sequence Number
A simple integer starting at 1, incrementing by 1 for each subtitle block. This tells the video player the order of subtitles.

### 2. Timecode
The format is: `HH:MM:SS,MMM --> HH:MM:SS,MMM`

- `HH` = hours (00-99)
- `MM` = minutes (00-59)
- `SS` = seconds (00-59)
- `MMM` = milliseconds (000-999)
- Note the **comma** before milliseconds — this is critical. A period instead of a comma will break many players.

The arrow `-->` separates the start time from the end time. The subtitle appears when the video reaches the start time and disappears at the end time.

### 3. Subtitle Text
One or more lines of text. Most players support basic HTML-like formatting tags:
- `<b>bold text</b>` for bold
- `<i>italic text</i>` for italics
- `<u>underlined</u>` for underlines
- `<font color="#FF0000">red text</font>` for color

### 4. Blank Line
Each subtitle block is separated by exactly one blank line. This is how the parser knows where one block ends and the next begins.

## SRT vs Other Subtitle Formats

SRT is the most common format, but there are others worth knowing:

**VTT (WebVTT)**: The web standard. Used by HTML5 video players. Similar to SRT but with a different header and some additional features. YouTube accepts both.

**ASS/SSA (Advanced SubStation Alpha)**: A more complex format that supports elaborate styling — per-character color changes, custom positions, karaoke timing. Used for anime fansubs.

**TTML (Timed Text Markup Language)**: An XML-based format used in professional broadcast workflows.

**SCC (Scenarist Closed Captions)**: Used in North American broadcast television, particularly for CEA-608/708 closed captions.

For most purposes — YouTube, social media, video editing — SRT is the right choice. It's simple, universal, and easy to create and edit.

## Where Are SRT Files Used?

### YouTube
YouTube accepts SRT files for captions. Upload your video, go to YouTube Studio > Subtitles, and add a subtitle track. You can upload an SRT file directly, and YouTube displays the captions in sync with your video. Viewers can enable or disable them with the CC button.

### Adobe Premiere Pro
Premiere Pro can import SRT files as a caption track. You can then edit timing, style the text, and export either with subtitles burned into the video or as a separate sidecar file.

### DaVinci Resolve
DaVinci Resolve (free version included) has excellent SRT import. Import via the Edit page timeline > Timeline > Import Subtitle.

### Final Cut Pro
Final Cut Pro supports SRT import through the Titles and Generators browser or via third-party plugins.

### VLC Media Player
Place an SRT file in the same folder as your video file with the same name (e.g., `myvideo.mp4` and `myvideo.srt`) and VLC automatically loads the subtitles when you open the video. No configuration required.

### Netflix and Streaming Services
Content delivered to Netflix and other streaming platforms typically uses more robust formats, but SRT is often the starting point in the workflow.

### Vimeo
Vimeo allows direct SRT upload for any video on paid plans, and the captions appear for all viewers.

## How to Create an SRT File

### The Fast Way: Browser-Based AI

The fastest way to create an SRT file from audio or video is using a tool like AudioSRT. The process:

1. Open [AudioSRT](/tool) in your browser
2. Upload your audio file (MP3, WAV, M4A, OGG, or OPUS)
3. Click Transcribe — Whisper AI runs in your browser
4. Edit any lines as needed
5. Click Download SRT File

Total time for a 5-minute audio file: typically 3-7 minutes, depending on your device.

### The Manual Way: Text Editor

If you need complete control, you can write an SRT file by hand in any plain text editor:

1. Open Notepad (Windows) or TextEdit in plain text mode (Mac)
2. Type each subtitle block following the format above
3. Separate blocks with blank lines
4. Save with a `.srt` extension
5. Choose UTF-8 encoding when saving

### The Video Editor Way

Most professional video editors (Premiere Pro, Final Cut, DaVinci) can export SRT files from their caption timelines. This is useful when you've already done timing work in your editor.

## Common SRT Mistakes to Avoid

**Wrong comma placement**: The timecode requires a comma before milliseconds — `00:00:05,500` not `00:00:05.500`. A period breaks most players.

**Missing blank lines**: Each block must be separated by exactly one blank line. Two blank lines or zero blank lines can cause parsing errors.

**Overlapping timecodes**: The end time of one subtitle should be before (or equal to) the start time of the next. Overlapping timecodes cause some players to display both simultaneously.

**Wrong encoding**: SRT files must use UTF-8 encoding to support special characters (accented letters, non-Latin scripts). Saving with Windows-1252 or Latin-1 encoding causes garbled text.

**Missing sequence numbers**: Some tools omit sequence numbers or use non-sequential numbers. Most players require sequential integers starting at 1.

## The SRT Format in Practice

Understanding the SRT format demystifies subtitles entirely. It's just text with timecodes. You can open, read, edit, and create SRT files with nothing more than a text editor and a stopwatch — though AI-powered tools like AudioSRT make the process dramatically faster and more accurate.

For anyone creating video content in 2026, having an SRT workflow is essential. It's the bridge between your audio and every subtitle-capable platform in existence.

[Create your first SRT file free →](/tool)
