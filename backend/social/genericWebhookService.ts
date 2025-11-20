import { logger } from '../utils/logger';

export async function postToWebhook(message: string, webhookUrl?: string) {
  logger.info(`[Webhook] Posting message: ${message}`);
  if (!webhookUrl) {
    logger.warn('[Webhook] Missing webhook URL, skipping');
  }
}
