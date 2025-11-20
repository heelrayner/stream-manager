import { logger } from '../utils/logger';
import { encrypt, decrypt } from '../utils/encryption';

export interface WebhookMessage {
  body: Record<string, unknown>;
}

export async function publishToWebhook(url: string, message: WebhookMessage) {
  const target = decrypt(url);
  logger.info('Posting to generic webhook', { target });
  return { status: 'posted', provider: 'webhook', message };
}

export function secureWebhook(url: string) {
  return encrypt(url);
}
