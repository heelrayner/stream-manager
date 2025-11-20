import { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import SchedulesPage from './pages/SchedulesPage';
import VodsPage from './pages/VodsPage';
import SettingsPage from './pages/SettingsPage';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'schedules', label: 'Shorts Scheduler' },
  { key: 'vods', label: 'VOD Uploads' },
  { key: 'settings', label: 'Settings' },
];

export default function App() {
  const [active, setActive] = useState('dashboard');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>streaman</h1>
        <div className="nav">
          {NAV_ITEMS.map((item) => (
            <button key={item.key} className={active === item.key ? 'active' : ''} onClick={() => setActive(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
      </aside>
      <main className="content">
        {active === 'dashboard' && <DashboardPage />}
        {active === 'accounts' && <AccountsPage />}
        {active === 'schedules' && <SchedulesPage />}
        {active === 'vods' && <VodsPage />}
        {active === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
