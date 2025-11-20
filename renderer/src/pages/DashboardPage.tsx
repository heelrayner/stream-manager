import React, { useEffect, useState } from 'react';
import { updateMetadata } from '../api/streamsApi';

const DashboardPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Just Chatting');
  const [game, setGame] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);

  useEffect(() => {
    window.api.listAlerts().then(setAlerts);
    window.api.getAccounts().then(setAccounts);
    const unsubscribe = window.api.onAlert((alert) => setAlerts((prev) => [alert, ...prev].slice(0, 50)));
    return () => unsubscribe();
  }, []);

  const toggleAccount = (id: number) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMetadata({ title, category, game, accountIds: selectedAccounts });
    setTitle('');
    setGame('');
  };

  const simulateAlert = async () => {
    await window.api.simulateAlert({ platform: 'Twitch', type: 'follow', message: 'New follow!', payload: { user: 'demo' } });
  };

  return (
    <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <h2>Stream Metadata</h2>
        <form onSubmit={handleUpdateMetadata} className="form-grid">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
          <input value={game} onChange={(e) => setGame(e.target.value)} placeholder="Game" />
          <div>
            <strong>Accounts</strong>
            <div className="flex">
              {accounts.map((account) => (
                <label key={account.id}>
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                  />{' '}
                  {account.displayName} ({account.platform})
                </label>
              ))}
            </div>
          </div>
          <button type="submit">Update Metadata</button>
        </form>
      </div>

      <div className="card">
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Alerts Feed</h2>
          <button onClick={simulateAlert}>Simulate Alert</button>
        </div>
        <div>
          {alerts.map((alert) => (
            <div key={alert.id} style={{ marginBottom: '0.5rem' }}>
              <span className="badge">{alert.platform}</span>{' '}
              <strong>{alert.type}</strong> - {alert.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
