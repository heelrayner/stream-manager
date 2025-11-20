import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import SchedulesPage from './pages/SchedulesPage';
import VodsPage from './pages/VodsPage';
import SettingsPage from './pages/SettingsPage';
import './styles.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1>streaman</h1>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/accounts">Accounts</NavLink>
          <NavLink to="/schedules">Shorts</NavLink>
          <NavLink to="/vods">VODs</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/vods" element={<VodsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
