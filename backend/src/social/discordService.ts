import { logger } from '../utils/logger';
import { encrypt, decrypt } from '../utils/encryption';

export interface DiscordMessage {
  content: string;
}

export async function publishToDiscord(webhookUrl: string, message: DiscordMessage) {
  const url = decrypt(webhookUrl);
  logger.info('Posting to Discord webhook', { urlPreview: url ? `${url.slice(0, 12)}...` : 'missing' });
  return { status: 'posted', provider: 'discord', message };
}

export function secureDiscordWebhook(rawUrl: string) {
  return encrypt(rawUrl);
}
