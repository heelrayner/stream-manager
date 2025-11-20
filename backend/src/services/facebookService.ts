import { Account } from '@prisma/client';
import { logger } from '../utils/logger';
import { PlatformClient, ShortFormSchedulePayload, StreamMetadata, VodUploadPayload } from './platformClient';

export class FacebookService implements PlatformClient {
  async refreshToken(account: Account) {
    logger.info('Refreshing Facebook token', { account: account.accountId });
    return { accessToken: account.accessToken, refreshToken: account.refreshToken, scopes: account.scopes };
  }

  async updateStreamInfo(account: Account, metadata: StreamMetadata) {
    logger.info('Updating Facebook stream metadata', { account: account.accountId, metadata });
  }

  async createLiveEvent(account: Account, metadata: StreamMetadata) {
    logger.info('Creating Facebook live event', { account: account.accountId, metadata });
  }

  async scheduleShort(account: Account, payload: ShortFormSchedulePayload) {
    logger.info('Scheduling Facebook short video', { account: account.accountId, payload });
    return { status: 'scheduled', externalId: `facebook-${Date.now()}` };
  }

  async uploadVOD(account: Account, payload: VodUploadPayload) {
    logger.info('Uploading Facebook VOD', { account: account.accountId, payload });
    return { status: 'uploaded', externalId: `facebook-vod-${Date.now()}` };
  }
}
