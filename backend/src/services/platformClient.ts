export interface PlatformClient {
  platform: string;
  refreshToken(accountId: number): Promise<void>;
  updateStreamInfo(accountId: number, payload: { title: string; category: string; game: string }): Promise<void>;
  createLiveEvent(accountId: number, payload: { title: string; scheduledTime: Date; description?: string }): Promise<void>;
  scheduleShort(accountId: number | null, payload: { title: string; description: string; tags: string[]; videoPath: string; scheduledTime: Date }): Promise<void>;
  uploadVOD(accountId: number | null, payload: { title: string; description: string; tags: string[]; videoPath: string; scheduledTime: Date }): Promise<void>;
}

export interface ShortStatusUpdate {
  id: number;
  status: 'pending' | 'uploading' | 'posted' | 'failed';
  resultMessage?: string;
}
