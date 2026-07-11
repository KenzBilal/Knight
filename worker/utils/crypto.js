// worker/utils/crypto.js
// AES-256-GCM encrypt/decrypt using Node.js built-in crypto.
// Requires ENCRYPTION_KEY env var (32-byte hex string).
// Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_HEX = process.env.ENCRYPTION_KEY || '';

function getKey() {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error('[Crypto] ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  return Buffer.from(KEY_HEX, 'hex');
}

/**
 * Encrypt a plaintext string.
 * Returns a string in the format: iv:authTag:ciphertext (all hex).
 */
export function encrypt(plaintext) {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a string produced by encrypt().
 */
export function decrypt(ciphertext) {
  const key = getKey();
  const [ivHex, authTagHex, dataHex] = ciphertext.split(':');
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error('[Crypto] Invalid ciphertext format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

/**
 * Check if a string looks like an encrypted value (iv:tag:data format).
 */
export function isEncrypted(value) {
  return typeof value === 'string' && value.split(':').length === 3 && value.length > 50;
}
