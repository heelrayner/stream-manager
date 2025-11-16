import { Platform } from '../types/models';
import { createElement, Fragment } from '../lib/tiny-react';

interface Props {
  form: {
    platform: Platform;
    username: string;
    apiKey: string;
    notes: string;
  };
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const platforms: { label: string; value: Platform }[] = [
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Twitch', value: 'twitch' },
  { label: 'Kick', value: 'kick' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Facebook', value: 'facebook' },
];

export function PlatformForm({ form, onChange, onSubmit, isSubmitting }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Connect a platform</h3>
        <p>Store API credentials locally so you never have to look them up again.</p>
      </div>
      <div className="card-body grid">
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
          Channel / Handle
          <input
            value={form.username}
            onInput={(event: Event) => onChange('username', (event.target as HTMLInputElement).value)}
            placeholder="Creator handle"
          />
        </label>
        <label>
          API token / Stream key
          <input
            value={form.apiKey}
            onInput={(event: Event) => onChange('apiKey', (event.target as HTMLInputElement).value)}
            placeholder="Paste secure token"
          />
        </label>
        <label className="full-width">
          Notes
          <textarea
            value={form.notes}
            onInput={(event: Event) => onChange('notes', (event.target as HTMLTextAreaElement).value)}
            placeholder="Where the key came from, scopes, etc."
          />
        </label>
      </div>
      <div className="card-footer">
        <button className="primary" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save credentials'}
        </button>
      </div>
    </div>
  );
}
