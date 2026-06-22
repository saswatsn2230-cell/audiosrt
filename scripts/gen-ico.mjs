// Builds a valid .ico file containing 16x16 and 32x32 PNG frames
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <rect width="96" height="96" rx="22" fill="#6366F1"/>
  <path d="M10 48 Q24 18 38 48 Q52 78 66 48 Q80 18 86 48"
        fill="none" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);

const png16 = await sharp(svg).resize(16, 16).png().toBuffer();
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
const png48 = await sharp(svg).resize(48, 48).png().toBuffer();

const images = [png16, png32, png48];
const sizes  = [16, 32, 48];
const count  = images.length;

// ICO header: 6 bytes
// Directory entries: count * 16 bytes
// Then raw PNG data
const headerSize = 6 + count * 16;
const offsets = [];
let offset = headerSize;
for (const img of images) { offsets.push(offset); offset += img.length; }

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: ICO
header.writeUInt16LE(count, 4);

const dir = Buffer.alloc(count * 16);
for (let i = 0; i < count; i++) {
  const d = i * 16;
  const s = sizes[i] === 256 ? 0 : sizes[i];
  dir.writeUInt8(s, d);       // width (0 = 256)
  dir.writeUInt8(s, d + 1);   // height
  dir.writeUInt8(0, d + 2);   // color count
  dir.writeUInt8(0, d + 3);   // reserved
  dir.writeUInt16LE(1, d + 4); // planes
  dir.writeUInt16LE(32, d + 6); // bit count
  dir.writeUInt32LE(images[i].length, d + 8); // size of image data
  dir.writeUInt32LE(offsets[i], d + 12);       // offset
}

writeFileSync('public/favicon.ico', Buffer.concat([header, dir, ...images]));
console.log('favicon.ico written with 16x16, 32x32, 48x48 frames');
