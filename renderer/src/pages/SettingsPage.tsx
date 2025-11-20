import React, { useEffect, useState } from 'react';
import { deleteSocialIntegration, listSocialIntegrations, saveSocialIntegration, goLive } from '../api/settingsApi';

const SettingsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [message, setMessage] = useState('We are going live now!');
  const [form, setForm] = useState({
    id: undefined as number | undefined,
    name: '',
    type: 'twitter',
    apiKey: '',
    webhookUrl: '',
    enabled: true,
    config: '{}',
    messageTemplate: ''
  });

  const load = () => listSocialIntegrations().then(setIntegrations);

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSocialIntegration({ ...form, config: form.config });
    setForm({ id: undefined, name: '', type: 'twitter', apiKey: '', webhookUrl: '', enabled: true, config: '{}', messageTemplate: '' });
    load();
  };

  const edit = (integration: any) => {
    setForm({ ...integration, apiKey: '', webhookUrl: '' });
  };

  const remove = async (id: number) => {
    await deleteSocialIntegration(id);
    load();
  };

  const triggerGoLive = async () => {
    await goLive(message);
  };

  return (
    <div className="flex" style={{ flexDirection: 'column' }}>
      <div className="card">
        <h2>Social Integrations</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="twitter">Twitter</option>
            <option value="discord">Discord</option>
            <option value="webhook">Webhook</option>
            <option value="custom">Custom</option>
          </select>
          <input value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="API Key" />
          <input value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} placeholder="Webhook URL" />
          <input value={form.messageTemplate} onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })} placeholder="Message Template" />
          <label>
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Enabled
          </label>
          <textarea value={form.config} onChange={(e) => setForm({ ...form, config: e.target.value })} placeholder="Config JSON" />
          <button type="submit">{form.id ? 'Update' : 'Add'} Integration</button>
        </form>
      </div>

      <div className="card">
        <h2>Existing Integrations</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((integration) => (
              <tr key={integration.id}>
                <td>{integration.name}</td>
                <td>{integration.type}</td>
                <td><span className="badge">{integration.enabled ? 'enabled' : 'disabled'}</span></td>
                <td>
                  <button onClick={() => edit(integration)}>Edit</button>
                  <button onClick={() => remove(integration.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Go-Live Message</h2>
        <div className="form-grid">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={triggerGoLive}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
