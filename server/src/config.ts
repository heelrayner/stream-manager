import { createHash } from 'node:crypto';
import { join } from 'node:path';

const PORT = Number(process.env.PORT || 4000);
const DB_PATH = process.env.DB_PATH || join(process.cwd(), 'stream_manager.db');
const RAW_KEY = process.env.ENCRYPTION_KEY || 'stream-manager-development-key';

function deriveKey(value: string): Buffer {
  return Buffer.from(createHash('sha256').update(value).digest('hex').slice(0, 64), 'hex');
}

export const config = {
  port: PORT,
  dbPath: DB_PATH,
  encryptionKey: deriveKey(RAW_KEY),
};
