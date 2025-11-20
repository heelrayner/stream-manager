import React, { useEffect, useState } from 'react';
import { createSchedule, listSchedules } from '../api/schedulesApi';
import { getAccounts } from '../api/accountsApi';

const platforms = ['Twitch', 'TikTok', 'Kick', 'YouTube', 'Facebook'];

const SchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    videoPath: '',
    scheduledTime: new Date().toISOString().slice(0, 16),
    platform: platforms[0],
    accountId: ''
  });

  const load = () => listSchedules().then(setSchedules);

  useEffect(() => {
    load();
    getAccounts().then(setAccounts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSchedule({
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      scheduledTime: new Date(form.scheduledTime).toISOString(),
      accountId: form.accountId ? Number(form.accountId) : undefined
    });
    setForm({ ...form, title: '', description: '', tags: '', videoPath: '' });
    load();
  };

  return (
    <div className="flex" style={{ flexDirection: 'column' }}>
      <div className="card">
        <h2>Schedule Short</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags" />
          <input value={form.videoPath} onChange={(e) => setForm({ ...form, videoPath: e.target.value })} placeholder="Video Path" />
          <input type="datetime-local" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} />
          <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
            {platforms.map((platform) => (
              <option key={platform}>{platform}</option>
            ))}
          </select>
          <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
            <option value="">Any Account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.displayName}
              </option>
            ))}
          </select>
          <button type="submit">Schedule</button>
        </form>
      </div>

      <div className="card">
        <h2>Pending Shorts</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Platform</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.platform}</td>
                <td>{new Date(item.scheduledTime).toLocaleString()}</td>
                <td><span className="badge">{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulesPage;
