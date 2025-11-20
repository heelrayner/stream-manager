import { Account } from '@prisma/client';
import { logger } from '../utils/logger';
import { PlatformClient, ShortFormSchedulePayload, StreamMetadata, VodUploadPayload } from './platformClient';

export class TwitchService implements PlatformClient {
  async refreshToken(account: Account) {
    logger.info('Refreshing Twitch token', { account: account.accountId });
    return { accessToken: account.accessToken, refreshToken: account.refreshToken, scopes: account.scopes };
  }

  async updateStreamInfo(account: Account, metadata: StreamMetadata) {
    logger.info('Updating Twitch stream metadata', { account: account.accountId, metadata });
  }

  async createLiveEvent(account: Account, metadata: StreamMetadata) {
    logger.info('Creating Twitch live event', { account: account.accountId, metadata });
  }

  async scheduleShort(account: Account, payload: ShortFormSchedulePayload) {
    logger.info('Scheduling Twitch short video', { account: account.accountId, payload });
    return { status: 'scheduled', externalId: `twitch-${Date.now()}` };
  }

  async uploadVOD(account: Account, payload: VodUploadPayload) {
    logger.info('Uploading Twitch VOD', { account: account.accountId, payload });
    return { status: 'uploaded', externalId: `twitch-vod-${Date.now()}` };
  }
}
