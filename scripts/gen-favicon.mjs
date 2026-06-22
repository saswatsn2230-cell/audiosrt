import sharp from 'sharp';

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <rect width="96" height="96" rx="22" fill="#6366F1"/>
  <path d="M10 48 Q24 18 38 48 Q52 78 66 48 Q80 18 86 48"
        fill="none" stroke="white" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);

await sharp(svg).resize(96, 96).png().toFile('public/favicon.png');
console.log('favicon.png (96x96) done');

await sharp(svg).resize(32, 32).png().toFile('public/favicon-32.png');
console.log('favicon-32.png done');

await sharp(svg).resize(16, 16).png().toFile('public/favicon-16.png');
console.log('favicon-16.png done');
