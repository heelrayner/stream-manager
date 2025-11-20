import { useEffect, useState } from 'react';
import { listVods, createVod } from '../api/vodsApi';
import { getAccounts } from '../api/accountsApi';

const PLATFORMS = ['TIKTOK', 'TWITCH', 'KICK', 'YOUTUBE', 'FACEBOOK'];

export default function VodsPage() {
  const [vods, setVods] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    videoPath: '',
    scheduledFor: '',
    platform: 'YOUTUBE',
    accountId: '',
  });

  const refresh = () => listVods().then(setVods);

  useEffect(() => {
    refresh();
    getAccounts().then(setAccounts);
  }, []);

  const submit = async () => {
    await createVod({
      title: form.title,
      description: form.description,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      videoPath: form.videoPath,
      scheduledFor: form.scheduledFor,
      platform: form.platform,
      accountId: form.accountId ? Number(form.accountId) : undefined,
    });
    setForm({ ...form, title: '', description: '', tags: '', videoPath: '', scheduledFor: '' });
    refresh();
  };

  return (
    <div>
      <h2>VOD Uploads</h2>
      <div className="card">
        <h3>Schedule upload</h3>
        <div className="form-row">
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label>
            Description
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Tags
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </label>
          <label>
            Video path
            <input value={form.videoPath} onChange={(e) => setForm({ ...form, videoPath: e.target.value })} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Scheduled time
            <input type="datetime-local" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} />
          </label>
          <label>
            Platform
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {PLATFORMS.map((platform) => (
                <option key={platform}>{platform}</option>
              ))}
            </select>
          </label>
          <label>
            Account
            <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
              <option value="">Auto</option>
              {accounts
                .filter((a) => a.platform === form.platform)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.displayName}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <button onClick={submit}>Queue upload</button>
      </div>

      <div className="card">
        <h3>Upload queue</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Platform</th>
              <th>Scheduled</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vods.map((vod) => (
              <tr key={vod.id}>
                <td>{vod.title}</td>
                <td>{vod.platform}</td>
                <td>{new Date(vod.scheduledFor).toLocaleString()}</td>
                <td>{vod.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
