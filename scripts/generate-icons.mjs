import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

function makeSvg(size) {
  const pad = Math.round(size * 0.14);
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#0F172A"/>
  <svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="0 0 100 100" fill="none">
    <polyline points="8,78 30,58 52,40 72,30 92,36"
      stroke="#22C55E" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="8" y1="58" x2="92" y2="58"
      stroke="#EF4444" stroke-width="6.5" stroke-linecap="round"/>
    <circle cx="30" cy="58" r="5" fill="#EF4444"/>
  </svg>
</svg>`;
}

for (const size of [192, 512]) {
  await sharp(Buffer.from(makeSvg(size))).png().toFile(join(publicDir, `icon-${size}.png`));
  console.log(`icon-${size}.png`);
}

// Apple touch icon — 180px, same design
await sharp(Buffer.from(makeSvg(180))).png().toFile(join(publicDir, 'apple-touch-icon.png'));
console.log('apple-touch-icon.png');
