import { Account } from '@prisma/client';

export interface StreamMetadata {
  title?: string;
  category?: string;
  game?: string;
}

export interface ShortFormSchedulePayload {
  title: string;
  description: string;
  tags: string[];
  videoPath: string;
  scheduledFor: Date;
}

export interface VodUploadPayload {
  title: string;
  description: string;
  tags: string[];
  videoPath: string;
  scheduledFor: Date;
}

export interface PlatformClient {
  refreshToken(account: Account): Promise<{ accessToken: string; refreshToken?: string; scopes?: string[] }>;
  updateStreamInfo(account: Account, metadata: StreamMetadata): Promise<void>;
  createLiveEvent(account: Account, metadata: StreamMetadata): Promise<void>;
  scheduleShort(account: Account, payload: ShortFormSchedulePayload): Promise<{ status: string; externalId?: string }>;
  uploadVOD(account: Account, payload: VodUploadPayload): Promise<{ status: string; externalId?: string }>;
}

export const successStub = async () => ({ status: 'ok' });
