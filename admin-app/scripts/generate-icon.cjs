#!/usr/bin/env node
// Generate Knight app icon as PNG
// Usage: node scripts/generate-icon.js

const fs = require('fs');
const path = require('path');

// Create a 512x512 PNG icon with a "K" lettermark
// This uses raw PNG creation without external dependencies

function createPNG(width, height, pixels) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let c = 0xFFFFFFFF;
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let v = n;
      for (let k = 0; k < 8; k++) v = v & 1 ? 0xEDB88320 ^ (v >>> 1) : v >>> 1;
      table[n] = v;
    }
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeData));
    return Buffer.concat([len, typeData, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT (raw image data with zlib)
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte: none
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rawData.push(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]);
    }
  }

  const raw = Buffer.from(rawData);
  // Simple zlib compression
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(raw, { level: 9 });

  // IEND
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', iend),
  ]);
}

function generateIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const innerRadius = size * 0.35;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: dark circle
      if (dist <= radius) {
        // Rounded square background
        const cornerRadius = size * 0.18;
        const inBox = Math.abs(dx) <= cx - cornerRadius && Math.abs(dy) <= cy - cornerRadius;
        const inCorner = (Math.abs(dx) - (cx - cornerRadius)) ** 2 + (Math.abs(dy) - (cy - cornerRadius)) ** 2 <= cornerRadius ** 2;

        if (inBox || inCorner) {
          // Inside the rounded rect
          pixels[idx] = 17;     // R
          pixels[idx + 1] = 17; // G
          pixels[idx + 2] = 17; // B
          pixels[idx + 3] = 255; // A

          // Draw "K" lettermark
          const kx = (x - cx) / (size * 0.25);
          const ky = (y - cy) / (size * 0.25);

          // K letter: vertical bar + two diagonals
          const inVBar = Math.abs(kx + 0.3) < 0.15 && Math.abs(ky) < 0.7;
          const inUpperDiag = ky < -0.05 && ky > -0.7 &&
            Math.abs(kx - ky * 0.5 - 0.1) < 0.12 &&
            kx > -0.1;
          const inLowerDiag = ky > 0.05 && ky < 0.7 &&
            Math.abs(kx + ky * 0.5 - 0.1) < 0.12 &&
            kx > -0.1;
          const inMiddle = Math.abs(kx) < 0.25 && Math.abs(ky) < 0.1;

          if (inVBar || inUpperDiag || inLowerDiag || inMiddle) {
            pixels[idx] = 235;     // R
            pixels[idx + 1] = 235; // G
            pixels[idx + 2] = 235; // B
            pixels[idx + 3] = 255; // A
          }
        } else {
          pixels[idx + 3] = 0;
        }
      } else {
        pixels[idx + 3] = 0;
      }
    }
  }

  return pixels;
}

// Generate icons
const sizes = [16, 32, 48, 64, 128, 256, 512];
const outDir = path.join(__dirname, '../electron/icons');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const size of sizes) {
  const pixels = generateIcon(size);
  const png = createPNG(size, size, pixels);
  const outPath = path.join(outDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Created ${outPath} (${png.length} bytes)`);
}

// Also copy the 512 icon to the root for electron-builder
const rootIcon = path.join(__dirname, '../electron/icon.png');
const mainIcon = generateIcon(512);
fs.writeFileSync(rootIcon, createPNG(512, 512, mainIcon));
console.log(`Created ${rootIcon}`);

console.log('\nDone! Icons generated in electron/icons/');
