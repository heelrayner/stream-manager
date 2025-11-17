import { StreamContent, StreamStatus } from '../types/models';
import { createElement, Fragment } from '../lib/tiny-react';

interface Props {
  streams: StreamContent[];
  onStatusChange: (id: number, status: StreamStatus) => void;
  onDelete: (id: number) => void;
}

const statusOptions: { label: string; value: StreamStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Live', value: 'live' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
];

function formatDate(dateString: string | null): string {
  if (!dateString) {
    return '—';
  }
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function StreamList({ streams, onStatusChange, onDelete }: Props) {
  if (!streams.length) {
    return (
      <div className="empty-state">
        <p>No content scheduled yet.</p>
      </div>
    );
  }
  return (
    <div className="table">
      <div className="table-row table-header">
        <span>Title</span>
        <span>Platform</span>
        <span>Scheduled</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {streams.map((stream) => (
        <div className="table-row">
          <span>
            <strong>{stream.title}</strong>
            <small>{stream.contentType}</small>
          </span>
          <span>{stream.platform}</span>
          <span>{formatDate(stream.scheduledAt)}</span>
          <span>
            <select
              value={stream.status}
              onChange={(event: Event) => onStatusChange(stream.id, (event.target as HTMLSelectElement).value as StreamStatus)}
            >
              {statusOptions.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </select>
          </span>
          <span>
            <button className="danger" onClick={() => onDelete(stream.id)}>
              Delete
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
