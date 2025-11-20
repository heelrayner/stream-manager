import { logger } from '../utils/logger';
import { encrypt, decrypt } from '../utils/encryption';

export interface TwitterMessage {
  text: string;
}

export async function publishToTwitter(apiKey: string, message: TwitterMessage) {
  const secret = decrypt(apiKey);
  logger.info('Posting to Twitter/X', { hasKey: Boolean(secret) });
  return { status: 'posted', provider: 'twitter', message };
}

export function secureTwitterKey(rawKey: string) {
  return encrypt(rawKey);
}
