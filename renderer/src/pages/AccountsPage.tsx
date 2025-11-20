import { useEffect, useState } from 'react';
import { connectAccount, disconnectAccount, getAccounts } from '../api/accountsApi';

const PLATFORMS = ['TIKTOK', 'TWITCH', 'KICK', 'YOUTUBE', 'FACEBOOK'];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    platform: 'TIKTOK',
    accountId: '',
    displayName: '',
    accessToken: '',
    refreshToken: '',
    scopes: '',
  });

  const refresh = () => getAccounts().then(setAccounts);

  useEffect(() => {
    refresh();
  }, []);

  const submit = async () => {
    await connectAccount({
      platform: form.platform,
      accountId: form.accountId,
      displayName: form.displayName,
      accessToken: form.accessToken,
      refreshToken: form.refreshToken,
      scopes: form.scopes.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setForm({ ...form, accountId: '', displayName: '', accessToken: '', refreshToken: '', scopes: '' });
    refresh();
  };

  const remove = async (id: number) => {
    await disconnectAccount(id);
    refresh();
  };

  return (
    <div>
      <h2>Accounts</h2>
      <div className="card">
        <h3>Connect account</h3>
        <div className="form-row">
          <label>
            Platform
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {PLATFORMS.map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </label>
          <label>
            Account ID
            <input value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} />
          </label>
          <label>
            Display name
            <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Access token
            <input value={form.accessToken} onChange={(e) => setForm({ ...form, accessToken: e.target.value })} />
          </label>
          <label>
            Refresh token
            <input value={form.refreshToken} onChange={(e) => setForm({ ...form, refreshToken: e.target.value })} />
          </label>
          <label>
            Scopes (comma separated)
            <input value={form.scopes} onChange={(e) => setForm({ ...form, scopes: e.target.value })} />
          </label>
        </div>
        <button onClick={submit}>Save account</button>
      </div>

      <div className="card">
        <h3>Linked accounts</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Display name</th>
              <th>Account ID</th>
              <th>Connected</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.platform}</td>
                <td>{account.displayName}</td>
                <td>{account.accountId}</td>
                <td>
                  <span className="badge">{account.connected ? 'connected' : 'disconnected'}</span>
                </td>
                <td>
                  <button onClick={() => remove(account.id)}>Disconnect</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
