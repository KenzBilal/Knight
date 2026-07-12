#!/usr/bin/env node
// Generate a simple notification sound as WAV
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createWav(sampleRate, channels, bitsPerSample, data) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = data.length;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  data.copy(buffer, headerSize);

  return buffer;
}

function generateTone(freq, duration, sampleRate, volume = 0.3) {
  const samples = Math.floor(sampleRate * duration);
  const data = Buffer.alloc(samples * 2); // 16-bit
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 8); // decay
    const value = Math.sin(2 * Math.PI * freq * t) * volume * envelope;
    const sample = Math.max(-32768, Math.min(32767, Math.floor(value * 32767)));
    data.writeInt16LE(sample, i * 2);
  }
  return data;
}

const sampleRate = 44100;
const outDir = path.join(__dirname, '../assets/sounds');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Notification sound: two quick ascending tones
const tone1 = generateTone(880, 0.08, sampleRate, 0.25);
const tone2 = generateTone(1100, 0.12, sampleRate, 0.25);
const silence = Buffer.alloc(Math.floor(sampleRate * 0.03) * 2); // 30ms silence

const notificationData = Buffer.concat([tone1, silence, tone2]);
const notificationWav = createWav(sampleRate, 1, 16, notificationData);
fs.writeFileSync(path.join(outDir, 'notification.wav'), notificationWav);
console.log('Created notification.wav');

// Success sound: ascending three-tone
const s1 = generateTone(660, 0.06, sampleRate, 0.2);
const s2 = generateTone(880, 0.06, sampleRate, 0.2);
const s3 = generateTone(1100, 0.1, sampleRate, 0.2);
const successData = Buffer.concat([s1, silence, s2, silence, s3]);
const successWav = createWav(sampleRate, 1, 16, successData);
fs.writeFileSync(path.join(outDir, 'success.wav'), successWav);
console.log('Created success.wav');

// Error sound: descending two-tone
const e1 = generateTone(600, 0.1, sampleRate, 0.3);
const e2 = generateTone(400, 0.15, sampleRate, 0.3);
const errorData = Buffer.concat([e1, silence, e2]);
const errorWav = createWav(sampleRate, 1, 16, errorData);
fs.writeFileSync(path.join(outDir, 'error.wav'), errorWav);
console.log('Created error.wav');

// Warning sound: single quick pulse
const w1 = generateTone(500, 0.08, sampleRate, 0.25);
const w2 = generateTone(500, 0.08, sampleRate, 0.25);
const warningData = Buffer.concat([w1, silence, w2]);
const warningWav = createWav(sampleRate, 1, 16, warningData);
fs.writeFileSync(path.join(outDir, 'warning.wav'), warningWav);
console.log('Created warning.wav');

console.log('All sounds generated in', outDir);
