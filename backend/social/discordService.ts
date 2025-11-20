import { logger } from '../utils/logger';

export async function postToDiscord(message: string, webhookUrl?: string) {
  logger.info(`[Discord] Posting message: ${message}`);
  if (!webhookUrl) {
    logger.warn('[Discord] Missing webhook URL, skipping');
  }
}
