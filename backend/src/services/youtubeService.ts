import { Account } from '@prisma/client';
import { logger } from '../utils/logger';
import { PlatformClient, ShortFormSchedulePayload, StreamMetadata, VodUploadPayload } from './platformClient';

export class YoutubeService implements PlatformClient {
  async refreshToken(account: Account) {
    logger.info('Refreshing YouTube token', { account: account.accountId });
    return { accessToken: account.accessToken, refreshToken: account.refreshToken, scopes: account.scopes };
  }

  async updateStreamInfo(account: Account, metadata: StreamMetadata) {
    logger.info('Updating YouTube stream metadata', { account: account.accountId, metadata });
  }

  async createLiveEvent(account: Account, metadata: StreamMetadata) {
    logger.info('Creating YouTube live event', { account: account.accountId, metadata });
  }

  async scheduleShort(account: Account, payload: ShortFormSchedulePayload) {
    logger.info('Scheduling YouTube short video', { account: account.accountId, payload });
    return { status: 'scheduled', externalId: `youtube-${Date.now()}` };
  }

  async uploadVOD(account: Account, payload: VodUploadPayload) {
    logger.info('Uploading YouTube VOD', { account: account.accountId, payload });
    return { status: 'uploaded', externalId: `youtube-vod-${Date.now()}` };
  }
}
