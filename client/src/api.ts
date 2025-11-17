import { PlatformAccount, StreamContent, DashboardSummary, Platform, ContentType, StreamStatus } from './types/models';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json();
}

export async function fetchPlatformAccounts(): Promise<PlatformAccount[]> {
  const res = await fetch('/api/platforms');
  return handleResponse(res);
}

export interface PlatformAccountPayload {
  platform: Platform;
  username: string;
  apiKey: string;
  notes?: string;
}

export async function createPlatformAccount(payload: PlatformAccountPayload): Promise<PlatformAccount> {
  const res = await fetch('/api/platforms', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updatePlatformAccount(id: number, payload: Partial<PlatformAccountPayload>): Promise<PlatformAccount> {
  const res = await fetch(`/api/platforms/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deletePlatformAccount(id: number): Promise<void> {
  const res = await fetch(`/api/platforms/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Delete failed');
  }
}

export interface StreamPayload {
  title: string;
  platform: Platform;
  contentType: ContentType;
  status: StreamStatus;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  notes?: string;
  accountId?: number | null;
}

export async function fetchStreams(): Promise<StreamContent[]> {
  const res = await fetch('/api/streams');
  return handleResponse(res);
}

export async function createStream(payload: StreamPayload): Promise<StreamContent> {
  const res = await fetch('/api/streams', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateStream(id: number, payload: Partial<StreamPayload>): Promise<StreamContent> {
  const res = await fetch(`/api/streams/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateStreamStatus(id: number, status: StreamStatus): Promise<StreamContent> {
  const res = await fetch(`/api/streams/${id}/status`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function deleteStream(id: number): Promise<void> {
  const res = await fetch(`/api/streams/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Delete failed');
  }
}

export async function fetchDashboard(): Promise<DashboardSummary> {
  const res = await fetch('/api/dashboard');
  return handleResponse(res);
}
