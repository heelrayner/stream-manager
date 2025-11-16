export type Platform = 'tiktok' | 'twitch' | 'kick' | 'youtube' | 'facebook';
export type ContentType = 'livestream' | 'short';
export type StreamStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'archived';

export interface PlatformAccount {
  id: number;
  platform: Platform;
  username: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  apiKeyPreview: string;
}

export interface StreamContent {
  id: number;
  title: string;
  platform: Platform;
  contentType: ContentType;
  status: StreamStatus;
  scheduledAt: string | null;
  durationMinutes: number | null;
  notes: string | null;
  accountId: number | null;
  accountUsername: string | null;
}

export interface DashboardSummary {
  totalAccounts: number;
  scheduledStreams: number;
  liveStreams: number;
  completedThisWeek: number;
}
