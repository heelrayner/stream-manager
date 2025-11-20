import { PlatformClient } from './platformClient';
import { logger } from '../../utils/logger';

export abstract class BasePlatformService implements PlatformClient {
  abstract platform: string;

  async refreshToken(accountId: number): Promise<void> {
    logger.info(`[${this.platform}] Refreshing token for account ${accountId}`);
  }

  async updateStreamInfo(accountId: number, payload: { title: string; category: string; game: string }): Promise<void> {
    logger.info(`[${this.platform}] Updating stream info for account ${accountId}: ${payload.title}`);
  }

  async createLiveEvent(accountId: number, payload: { title: string; scheduledTime: Date; description?: string }): Promise<void> {
    logger.info(`[${this.platform}] Creating live event for account ${accountId} at ${payload.scheduledTime.toISOString()}`);
  }

  async scheduleShort(accountId: number | null, payload: { title: string; description: string; tags: string[]; videoPath: string; scheduledTime: Date }): Promise<void> {
    logger.info(`[${this.platform}] Scheduling short ${payload.title} for ${payload.scheduledTime.toISOString()} on account ${accountId}`);
  }

  async uploadVOD(accountId: number | null, payload: { title: string; description: string; tags: string[]; videoPath: string; scheduledTime: Date }): Promise<void> {
    logger.info(`[${this.platform}] Uploading VOD ${payload.title} scheduled ${payload.scheduledTime.toISOString()} on account ${accountId}`);
  }
}
