import { PlatformAccountRecord, StreamRecord, PlatformAccountResponse, StreamResponse } from './types.js';
import { config } from './config.js';
import { previewSecret } from './encryption.js';
import { findAccountById } from './db.js';

export function mapAccount(record: PlatformAccountRecord): PlatformAccountResponse {
  return {
    id: record.id,
    platform: record.platform,
    username: record.username,
    notes: record.notes,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    apiKeyPreview: previewSecret(record.api_key_encrypted, config.encryptionKey),
  };
}

export function mapStream(record: StreamRecord): StreamResponse {
  const linkedAccount = record.account_id ? findAccountById(record.account_id) : null;
  return {
    id: record.id,
    title: record.title,
    platform: record.platform,
    contentType: record.content_type,
    status: record.status,
    scheduledAt: record.scheduled_at,
    durationMinutes: record.duration_minutes,
    notes: record.notes,
    accountId: record.account_id,
    accountUsername: linkedAccount ? linkedAccount.username : null,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}
