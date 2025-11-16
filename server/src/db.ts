import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.js';
import { PlatformAccountRecord, StreamRecord, Platform, ContentType, StreamStatus } from './types.js';

const dbDir = dirname(config.dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(config.dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS platform_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    content_type TEXT NOT NULL,
    status TEXT NOT NULL,
    scheduled_at TEXT,
    duration_minutes INTEGER,
    notes TEXT,
    account_id INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES platform_accounts(id) ON DELETE SET NULL
  );
`);

export function listPlatformAccounts(): PlatformAccountRecord[] {
  const statement = db.prepare('SELECT * FROM platform_accounts ORDER BY created_at DESC');
  return statement.all() as PlatformAccountRecord[];
}

export function insertPlatformAccount(data: {
  platform: Platform;
  username: string;
  api_key_encrypted: string;
  notes?: string | null;
}): PlatformAccountRecord {
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO platform_accounts (platform, username, api_key_encrypted, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(data.platform, data.username, data.api_key_encrypted, data.notes || null, now, now);
  const id = Number(result.lastInsertRowid);
  const recordStmt = db.prepare('SELECT * FROM platform_accounts WHERE id = ?');
  return recordStmt.get(id) as PlatformAccountRecord;
}

export function deletePlatformAccountRecord(id: number): void {
  const stmt = db.prepare('DELETE FROM platform_accounts WHERE id = ?');
  stmt.run(id);
}

export function updatePlatformAccountRecord(
  id: number,
  data: Partial<{ platform: Platform; username: string; api_key_encrypted: string; notes: string | null }>
): PlatformAccountRecord | null {
  const existing = db.prepare('SELECT * FROM platform_accounts WHERE id = ?').get(id) as PlatformAccountRecord | undefined;
  if (!existing) {
    return null;
  }
  const updated: PlatformAccountRecord = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };
  db.prepare(
    `UPDATE platform_accounts SET platform = ?, username = ?, api_key_encrypted = ?, notes = ?, updated_at = ? WHERE id = ?`
  ).run(updated.platform, updated.username, updated.api_key_encrypted, updated.notes, updated.updated_at, id);
  return db.prepare('SELECT * FROM platform_accounts WHERE id = ?').get(id) as PlatformAccountRecord;
}

export function listStreams(): StreamRecord[] {
  const statement = db.prepare('SELECT * FROM streams ORDER BY scheduled_at IS NULL, scheduled_at ASC');
  return statement.all() as StreamRecord[];
}

export function insertStream(data: {
  title: string;
  platform: Platform;
  content_type: ContentType;
  status: StreamStatus;
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  notes?: string | null;
  account_id?: number | null;
}): StreamRecord {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO streams (title, platform, content_type, status, scheduled_at, duration_minutes, notes, account_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.title,
    data.platform,
    data.content_type,
    data.status,
    data.scheduled_at || null,
    data.duration_minutes ?? null,
    data.notes || null,
    data.account_id ?? null,
    now,
    now
  );
  const id = Number(result.lastInsertRowid);
  const recordStmt = db.prepare('SELECT * FROM streams WHERE id = ?');
  return recordStmt.get(id) as StreamRecord;
}

export function updateStreamRecord(id: number, data: Partial<Omit<StreamRecord, 'id'>>): StreamRecord | null {
  const existing = db.prepare('SELECT * FROM streams WHERE id = ?').get(id) as StreamRecord | undefined;
  if (!existing) {
    return null;
  }
  const updated: StreamRecord = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };
  const stmt = db.prepare(`
    UPDATE streams SET title = ?, platform = ?, content_type = ?, status = ?, scheduled_at = ?, duration_minutes = ?, notes = ?, account_id = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run(
    updated.title,
    updated.platform,
    updated.content_type,
    updated.status,
    updated.scheduled_at,
    updated.duration_minutes,
    updated.notes,
    updated.account_id,
    updated.updated_at,
    id
  );
  return db.prepare('SELECT * FROM streams WHERE id = ?').get(id) as StreamRecord;
}

export function deleteStreamRecord(id: number): void {
  db.prepare('DELETE FROM streams WHERE id = ?').run(id);
}

export function dashboardSummary(): { totalAccounts: number; scheduledStreams: number; liveStreams: number; completedThisWeek: number } {
  const totalAccounts = (db.prepare('SELECT COUNT(*) as count FROM platform_accounts').get() as { count: number }).count;
  const scheduledStreams = (db
    .prepare("SELECT COUNT(*) as count FROM streams WHERE status IN ('scheduled', 'draft')")
    .get() as { count: number }).count;
  const liveStreams = (db.prepare("SELECT COUNT(*) as count FROM streams WHERE status = 'live'").get() as { count: number }).count;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const completedThisWeek = (db
    .prepare("SELECT COUNT(*) as count FROM streams WHERE status = 'completed' AND updated_at >= ?")
    .get(oneWeekAgo) as { count: number }).count;
  return { totalAccounts, scheduledStreams, liveStreams, completedThisWeek };
}

export function findAccountById(id: number): PlatformAccountRecord | null {
  const record = db.prepare('SELECT * FROM platform_accounts WHERE id = ?').get(id);
  return (record as PlatformAccountRecord) || null;
}
