import crypto from 'crypto';

const ALGORITHM = 'aes-256-ctr';
const KEY = crypto
  .createHash('sha256')
  .update(process.env.STREAMAN_SECRET || 'streaman-local-dev-key')
  .digest();

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(payload: string | null): string {
  if (!payload) return '';
  const [ivHex, dataHex] = payload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
