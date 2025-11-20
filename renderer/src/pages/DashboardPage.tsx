import { useEffect, useState } from 'react';
import { ipc } from '../api/ipcClient';
import { updateMetadata } from '../api/streamsApi';
import { getAccounts } from '../api/accountsApi';

interface AccountSummary {
  id: number;
  platform: string;
  displayName: string;
  accountId: string;
}

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [metadata, setMetadata] = useState({ title: '', category: '', game: '', accountIds: [] as number[] });
  const [highlight, setHighlight] = useState({ label: '', timestamp: 0, note: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    ipc.alerts.list().then(setAlerts);
    getAccounts().then(setAccounts);
    const unsubscribe = ipc.alerts.onNew((alert) => setAlerts((prev) => [alert, ...prev].slice(0, 50)));
    return unsubscribe;
  }, []);

  const toggleAccount = (id: number) => {
    setMetadata((prev) => {
      const exists = prev.accountIds.includes(id);
      const updated = exists ? prev.accountIds.filter((v) => v !== id) : [...prev.accountIds, id];
      return { ...prev, accountIds: updated };
    });
  };

  const submitMetadata = async () => {
    await updateMetadata(metadata);
    setMessage('Stream metadata update sent');
  };

  const saveHighlight = async () => {
    await ipc.highlights.add(highlight);
    setHighlight({ label: '', timestamp: 0, note: '' });
    setMessage('Highlight captured');
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {message && <div className="card">{message}</div>}
      <div className="card">
        <h3>Live Alerts</h3>
        <ul className="alert-feed">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <strong>{alert.type}</strong> on {alert.platform} — {alert.payload?.user || alert.payload?.amount || ''}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Stream Metadata</h3>
        <div className="form-row">
          <label>
            Title
            <input value={metadata.title} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} />
          </label>
          <label>
            Category
            <input value={metadata.category} onChange={(e) => setMetadata({ ...metadata, category: e.target.value })} />
          </label>
          <label>
            Game
            <input value={metadata.game} onChange={(e) => setMetadata({ ...metadata, game: e.target.value })} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Platforms
            <div>
              {accounts.map((account) => (
                <label key={account.id} style={{ display: 'block', marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={metadata.accountIds.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                  />{' '}
                  {account.platform} — {account.displayName}
                </label>
              ))}
            </div>
          </label>
        </div>
        <button onClick={submitMetadata}>Update metadata</button>
      </div>

      <div className="card">
        <h3>Highlights</h3>
        <div className="form-row">
          <label>
            Label
            <input value={highlight.label} onChange={(e) => setHighlight({ ...highlight, label: e.target.value })} />
          </label>
          <label>
            Timestamp (seconds)
            <input
              type="number"
              value={highlight.timestamp}
              onChange={(e) => setHighlight({ ...highlight, timestamp: Number(e.target.value) })}
            />
          </label>
          <label>
            Note
            <input value={highlight.note} onChange={(e) => setHighlight({ ...highlight, note: e.target.value })} />
          </label>
        </div>
        <button onClick={saveHighlight}>Save highlight</button>
      </div>
    </div>
  );
}
