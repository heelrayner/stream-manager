export type Platform = 'tiktok' | 'twitch' | 'kick' | 'youtube' | 'facebook';
export type ContentType = 'livestream' | 'short';
export type StreamStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'archived';

export interface PlatformAccountRecord {
  id: number;
  platform: Platform;
  username: string;
  api_key_encrypted: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreamRecord {
  id: number;
  title: string;
  platform: Platform;
  content_type: ContentType;
  status: StreamStatus;
  scheduled_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  account_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformAccountResponse {
  id: number;
  platform: Platform;
  username: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  apiKeyPreview: string;
}

export interface StreamResponse {
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
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalAccounts: number;
  scheduledStreams: number;
  liveStreams: number;
  completedThisWeek: number;
}
