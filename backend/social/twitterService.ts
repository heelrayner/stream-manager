import { logger } from '../utils/logger';

export async function postToTwitter(message: string, apiKey?: string) {
  logger.info(`[Twitter] Posting message: ${message}`);
  if (!apiKey) {
    logger.warn('[Twitter] Missing API key, skipping');
  }
}
