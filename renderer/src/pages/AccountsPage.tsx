import React, { useEffect, useState } from 'react';
import { connectAccount, disconnectAccount, getAccounts } from '../api/accountsApi';

const platforms = ['Twitch', 'TikTok', 'Kick', 'YouTube', 'Facebook'];

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    platform: platforms[0],
    externalId: '',
    displayName: '',
    accessToken: '',
    refreshToken: '',
    scopes: ''
  });

  const load = () => getAccounts().then(setAccounts);
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await connectAccount({ ...form, scopes: form.scopes.split(',').map((s) => s.trim()).filter(Boolean) });
    setForm({ ...form, externalId: '', displayName: '', accessToken: '', refreshToken: '', scopes: '' });
    load();
  };

  const disconnect = async (id: number) => {
    await disconnectAccount(id);
    load();
  };

  return (
    <div className="flex" style={{ flexDirection: 'column' }}>
      <div className="card">
        <h2>Connect Account</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
            {platforms.map((platform) => (
              <option key={platform}>{platform}</option>
            ))}
          </select>
          <input value={form.externalId} onChange={(e) => setForm({ ...form, externalId: e.target.value })} placeholder="External ID" required />
          <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Display Name" required />
          <input value={form.accessToken} onChange={(e) => setForm({ ...form, accessToken: e.target.value })} placeholder="Access Token" required />
          <input value={form.refreshToken} onChange={(e) => setForm({ ...form, refreshToken: e.target.value })} placeholder="Refresh Token" required />
          <input value={form.scopes} onChange={(e) => setForm({ ...form, scopes: e.target.value })} placeholder="Scopes (comma separated)" />
          <button type="submit">Save</button>
        </form>
      </div>
      <div className="card">
        <h2>Linked Accounts</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Name</th>
              <th>Scopes</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.platform}</td>
                <td>{account.displayName}</td>
                <td>{account.scopes}</td>
                <td><span className="badge">{account.connectionStatus}</span></td>
                <td><button onClick={() => disconnect(account.id)}>Disconnect</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsPage;
