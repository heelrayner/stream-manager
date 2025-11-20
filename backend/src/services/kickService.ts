import { Account } from '@prisma/client';
import { logger } from '../utils/logger';
import { PlatformClient, ShortFormSchedulePayload, StreamMetadata, VodUploadPayload } from './platformClient';

export class KickService implements PlatformClient {
  async refreshToken(account: Account) {
    logger.info('Refreshing Kick token', { account: account.accountId });
    return { accessToken: account.accessToken, refreshToken: account.refreshToken, scopes: account.scopes };
  }

  async updateStreamInfo(account: Account, metadata: StreamMetadata) {
    logger.info('Updating Kick stream metadata', { account: account.accountId, metadata });
  }

  async createLiveEvent(account: Account, metadata: StreamMetadata) {
    logger.info('Creating Kick live event', { account: account.accountId, metadata });
  }

  async scheduleShort(account: Account, payload: ShortFormSchedulePayload) {
    logger.info('Scheduling Kick short video', { account: account.accountId, payload });
    return { status: 'scheduled', externalId: `kick-${Date.now()}` };
  }

  async uploadVOD(account: Account, payload: VodUploadPayload) {
    logger.info('Uploading Kick VOD', { account: account.accountId, payload });
    return { status: 'uploaded', externalId: `kick-vod-${Date.now()}` };
  }
}
