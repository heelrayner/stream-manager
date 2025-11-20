import { Account } from '@prisma/client';
import { logger } from '../utils/logger';
import { PlatformClient, ShortFormSchedulePayload, StreamMetadata, VodUploadPayload } from './platformClient';

export class TiktokService implements PlatformClient {
  async refreshToken(account: Account) {
    logger.info('Refreshing TikTok token', { account: account.accountId });
    return { accessToken: account.accessToken, refreshToken: account.refreshToken, scopes: account.scopes };
  }

  async updateStreamInfo(account: Account, metadata: StreamMetadata) {
    logger.info('Updating TikTok stream metadata', { account: account.accountId, metadata });
  }

  async createLiveEvent(account: Account, metadata: StreamMetadata) {
    logger.info('Creating TikTok live event', { account: account.accountId, metadata });
  }

  async scheduleShort(account: Account, payload: ShortFormSchedulePayload) {
    logger.info('Scheduling TikTok short video', { account: account.accountId, payload });
    return { status: 'scheduled', externalId: `tiktok-${Date.now()}` };
  }

  async uploadVOD(account: Account, payload: VodUploadPayload) {
    logger.info('Uploading TikTok VOD', { account: account.accountId, payload });
    return { status: 'uploaded', externalId: `tiktok-vod-${Date.now()}` };
  }
}
