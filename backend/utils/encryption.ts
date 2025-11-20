import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.createHash('sha256').update(process.env.STREAMAN_SECRET || 'streaman-local-secret').digest();

export function encrypt(value: string): { iv: string; content: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: tag.toString('hex')
  };
}

export function decrypt(payload: { iv: string; content: string; tag: string }): string {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(payload.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.content, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

export function mask(value: string): string {
  if (!value) return '';
  if (value.length <= 6) return '*'.repeat(value.length);
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}
