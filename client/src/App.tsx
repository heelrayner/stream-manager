import { createElement, Fragment, useEffect, useState } from './lib/tiny-react';
import { Dashboard } from './components/Dashboard';
import { PlatformForm } from './components/PlatformForm';
import { PlatformList } from './components/PlatformList';
import { StreamForm } from './components/StreamForm';
import { StreamList } from './components/StreamList';
import {
  PlatformAccount,
  StreamContent,
  DashboardSummary,
  Platform,
  ContentType,
  StreamStatus,
} from './types/models';
import {
  fetchPlatformAccounts,
  createPlatformAccount,
  deletePlatformAccount,
  fetchStreams,
  createStream,
  updateStreamStatus,
  deleteStream,
  fetchDashboard,
} from './api';

interface PlatformFormState {
  platform: Platform;
  username: string;
  apiKey: string;
  notes: string;
}

interface StreamFormState {
  title: string;
  platform: Platform;
  contentType: ContentType;
  status: StreamStatus;
  scheduledAt: string;
  durationMinutes: string;
  notes: string;
  accountId: string;
}

const defaultPlatformForm: PlatformFormState = {
  platform: 'tiktok',
  username: '',
  apiKey: '',
  notes: '',
};

const defaultStreamForm: StreamFormState = {
  title: '',
  platform: 'tiktok',
  contentType: 'livestream',
  status: 'draft',
  scheduledAt: '',
  durationMinutes: '',
  notes: '',
  accountId: '',
};

export function App() {
  const [platforms, setPlatforms] = useState<PlatformAccount[]>([]);
  const [streams, setStreams] = useState<StreamContent[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [platformForm, setPlatformForm] = useState<PlatformFormState>({ ...defaultPlatformForm });
  const [streamForm, setStreamForm] = useState<StreamFormState>({ ...defaultStreamForm });
  const [isSavingPlatform, setIsSavingPlatform] = useState(false);
  const [isSavingStream, setIsSavingStream] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshAll() {
    try {
      const [accounts, streamItems, summary] = await Promise.all([
        fetchPlatformAccounts(),
        fetchStreams(),
        fetchDashboard(),
      ]);
      setPlatforms(accounts);
      setStreams(streamItems);
      setDashboard(summary);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  function handlePlatformChange(field: string, value: string) {
    setPlatformForm({ ...platformForm, [field]: value });
  }

  async function handlePlatformSubmit() {
    if (!platformForm.username || !platformForm.apiKey) {
      setError('Please provide a handle and API token.');
      return;
    }
    setIsSavingPlatform(true);
    setError(null);
    try {
      const saved = await createPlatformAccount(platformForm);
      setPlatforms([...platforms, saved]);
      setPlatformForm({ ...defaultPlatformForm, platform: platformForm.platform });
      refreshDashboard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSavingPlatform(false);
    }
  }

  async function handleDeletePlatform(id: number) {
    if (!confirm('Remove this platform? Stored tokens will be deleted.')) {
      return;
    }
    try {
      await deletePlatformAccount(id);
      setPlatforms(platforms.filter((account) => account.id !== id));
      refreshDashboard();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleStreamChange(field: string, value: string) {
    setStreamForm({ ...streamForm, [field]: value });
  }

  async function handleStreamSubmit() {
    if (!streamForm.title) {
      setError('Please give the stream a title.');
      return;
    }
    setIsSavingStream(true);
    setError(null);
    try {
      const payload = {
        title: streamForm.title,
        platform: streamForm.platform,
        contentType: streamForm.contentType,
        status: streamForm.status,
        scheduledAt: streamForm.scheduledAt || null,
        durationMinutes: streamForm.durationMinutes ? Number(streamForm.durationMinutes) : null,
        notes: streamForm.notes,
        accountId: streamForm.accountId ? Number(streamForm.accountId) : null,
      };
      const created = await createStream(payload);
      setStreams([created, ...streams]);
      setStreamForm({ ...defaultStreamForm, platform: streamForm.platform });
      refreshDashboard();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSavingStream(false);
    }
  }

  async function handleStatusChange(id: number, status: StreamStatus) {
    try {
      const updated = await updateStreamStatus(id, status);
      setStreams(streams.map((stream) => (stream.id === id ? updated : stream)));
      refreshDashboard();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDeleteStream(id: number) {
    if (!confirm('Delete this entry?')) {
      return;
    }
    try {
      await deleteStream(id);
      setStreams(streams.filter((stream) => stream.id !== id));
      refreshDashboard();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function refreshDashboard() {
    try {
      const summary = await fetchDashboard();
      setDashboard(summary);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="page">
      <header>
        <div>
          <h1>Stream Manager</h1>
          <p>One command center for livestreams and shorts on TikTok, Twitch, Kick, YouTube, and Facebook.</p>
        </div>
        <button onClick={refreshAll}>Refresh data</button>
      </header>
      {error && <div className="alert">{error}</div>}
      <Dashboard summary={dashboard} />
      <section className="two-column">
        <PlatformForm form={platformForm} onChange={handlePlatformChange} onSubmit={handlePlatformSubmit} isSubmitting={isSavingPlatform} />
        <StreamForm
          form={streamForm}
          onChange={handleStreamChange}
          onSubmit={handleStreamSubmit}
          isSubmitting={isSavingStream}
          accounts={platforms}
        />
      </section>
      <section className="two-column">
        <div>
          <h2>Connected platforms</h2>
          <PlatformList accounts={platforms} onDelete={handleDeletePlatform} />
        </div>
        <div>
          <h2>Upcoming & active content</h2>
          <StreamList streams={streams} onStatusChange={handleStatusChange} onDelete={handleDeleteStream} />
        </div>
      </section>
    </div>
  );
}
