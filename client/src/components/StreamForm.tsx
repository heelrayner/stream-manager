import { ContentType, Platform, StreamStatus, PlatformAccount } from '../types/models';
import { createElement, Fragment } from '../lib/tiny-react';

interface Props {
  form: {
    title: string;
    platform: Platform;
    contentType: ContentType;
    status: StreamStatus;
    scheduledAt: string;
    durationMinutes: string;
    notes: string;
    accountId: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  accounts: PlatformAccount[];
}

const platforms: { label: string; value: Platform }[] = [
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Twitch', value: 'twitch' },
  { label: 'Kick', value: 'kick' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Facebook', value: 'facebook' },
];

const contentTypes: { label: string; value: ContentType }[] = [
  { label: 'Livestream', value: 'livestream' },
  { label: 'Short / Clip', value: 'short' },
];

const statuses: { label: string; value: StreamStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Live', value: 'live' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
];

export function StreamForm({ form, onChange, onSubmit, isSubmitting, accounts }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Plan content</h3>
        <p>Track upcoming livestreams and shorts across every platform.</p>
      </div>
      <div className="card-body grid">
        <label>
          Title
          <input
            value={form.title}
            onInput={(event: Event) => onChange('title', (event.target as HTMLInputElement).value)}
            placeholder="Stream or short name"
          />
        </label>
        <label>
          Platform
          <select
            value={form.platform}
            onChange={(event: Event) => onChange('platform', (event.target as HTMLSelectElement).value)}
          >
            {platforms.map((platform) => (
              <option value={platform.value}>{platform.label}</option>
            ))}
          </select>
        </label>
        <label>
          Content type
          <select
            value={form.contentType}
            onChange={(event: Event) => onChange('contentType', (event.target as HTMLSelectElement).value)}
          >
            {contentTypes.map((content) => (
              <option value={content.value}>{content.label}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(event: Event) => onChange('status', (event.target as HTMLSelectElement).value)}
          >
            {statuses.map((status) => (
              <option value={status.value}>{status.label}</option>
            ))}
          </select>
        </label>
        <label>
          Scheduled for
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onInput={(event: Event) => onChange('scheduledAt', (event.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          Duration (minutes)
          <input
            type="number"
            min="0"
            value={form.durationMinutes}
            onInput={(event: Event) => onChange('durationMinutes', (event.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          Linked account
          <select
            value={form.accountId}
            onChange={(event: Event) => onChange('accountId', (event.target as HTMLSelectElement).value)}
          >
            <option value="">No link</option>
            {accounts.map((account) => (
              <option value={String(account.id)}>
                {account.username} ({account.platform})
              </option>
            ))}
          </select>
        </label>
        <label className="full-width">
          Notes / assets
          <textarea
            value={form.notes}
            onInput={(event: Event) => onChange('notes', (event.target as HTMLTextAreaElement).value)}
            placeholder="Assets, sponsors, collaborators"
          />
        </label>
      </div>
      <div className="card-footer">
        <button className="primary" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Add to schedule'}
        </button>
      </div>
    </div>
  );
}
