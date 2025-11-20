import { useEffect, useState } from 'react';
import { addIntegration, deleteIntegration, listIntegrations, updateIntegration } from '../api/settingsApi';

const TYPES = ['twitter', 'discord', 'webhook', 'custom'];

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    type: 'twitter',
    apiKey: '',
    webhookUrl: '',
    messageTemplate: 'Going live! {{message}}',
    enabled: true,
  });

  const refresh = () => listIntegrations().then(setIntegrations);

  useEffect(() => {
    refresh();
  }, []);

  const submit = async () => {
    await addIntegration(form);
    setForm({ name: '', type: 'twitter', apiKey: '', webhookUrl: '', messageTemplate: 'Going live! {{message}}', enabled: true });
    refresh();
  };

  const toggleEnabled = async (integration: any) => {
    await updateIntegration(integration.id, { enabled: !integration.enabled });
    refresh();
  };

  const remove = async (id: number) => {
    await deleteIntegration(id);
    refresh();
  };

  return (
    <div>
      <h2>Settings</h2>
      <div className="card">
        <h3>Social integrations</h3>
        <div className="form-row">
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Message template
            <input value={form.messageTemplate} onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })} />
          </label>
        </div>
        <div className="form-row">
          <label>
            API key
            <input value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
          </label>
          <label>
            Webhook URL
            <input value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} />
          </label>
        </div>
        <button onClick={submit}>Add integration</button>
      </div>

      <div className="card">
        <h3>Configured integrations</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((integration) => (
              <tr key={integration.id}>
                <td>{integration.name}</td>
                <td>{integration.type}</td>
                <td>{integration.enabled ? 'yes' : 'no'}</td>
                <td>
                  <button onClick={() => toggleEnabled(integration)}>{integration.enabled ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => remove(integration.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
