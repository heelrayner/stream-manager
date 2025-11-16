import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-cbc';

export function encryptSecret(secret: string, key: Buffer): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = cipher.update(secret, 'utf8', 'base64') + cipher.final('base64');
  const payload = `${iv.toString('base64')}:${encrypted}`;
  const hmac = createHmac('sha256', key).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

export function decryptSecret(encryptedValue: string, key: Buffer): string | null {
  const parts = encryptedValue.split(':');
  if (parts.length !== 3) {
    return null;
  }
  const [ivB64, ciphertext, hmac] = parts;
  const payload = `${ivB64}:${ciphertext}`;
  const recalculated = createHmac('sha256', key).update(payload).digest('hex');
  if (recalculated !== hmac) {
    return null;
  }
  const iv = Buffer.from(ivB64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  try {
    const decrypted = decipher.update(ciphertext, 'base64', 'utf8') + decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return null;
  }
}

export function previewSecret(encryptedValue: string, key: Buffer): string {
  const decrypted = decryptSecret(encryptedValue, key);
  if (!decrypted) {
    return 'invalid-secret';
  }
  const visible = decrypted.slice(-4).padStart(decrypted.length, '•');
  return visible.length > 12 ? `${visible.slice(0, 4)}…${decrypted.slice(-2)}` : `•••${decrypted.slice(-2)}`;
}
