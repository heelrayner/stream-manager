import { PlatformAccount } from '../types/models';
import { createElement, Fragment } from '../lib/tiny-react';

interface Props {
  accounts: PlatformAccount[];
  onDelete: (id: number) => void;
}

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  twitch: '🎮',
  kick: '⚡',
  youtube: '▶️',
  facebook: '📘',
};

export function PlatformList({ accounts, onDelete }: Props) {
  if (!accounts.length) {
    return (
      <div className="empty-state">
        <p>No platforms connected yet.</p>
      </div>
    );
  }
  return (
    <div className="table">
      <div className="table-row table-header">
        <span>Platform</span>
        <span>Account</span>
        <span>Stored key</span>
        <span>Actions</span>
      </div>
      {accounts.map((account) => (
        <div className="table-row">
          <span>
            {platformIcons[account.platform] || '🔗'} {account.platform}
          </span>
          <span>{account.username}</span>
          <span>{account.apiKeyPreview}</span>
          <span>
            <button className="danger" onClick={() => onDelete(account.id)}>Remove</button>
          </span>
        </div>
      ))}
    </div>
  );
}
