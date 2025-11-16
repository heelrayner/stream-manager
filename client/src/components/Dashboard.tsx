import { DashboardSummary } from '../types/models';
import { createElement, Fragment } from '../lib/tiny-react';

interface Props {
  summary: DashboardSummary | null;
}

const fallbackSummary: DashboardSummary = {
  totalAccounts: 0,
  scheduledStreams: 0,
  liveStreams: 0,
  completedThisWeek: 0,
};

export function Dashboard({ summary }: Props) {
  const data = summary || fallbackSummary;
  const items = [
    { label: 'Connected platforms', value: data.totalAccounts },
    { label: 'Scheduled events', value: data.scheduledStreams },
    { label: 'Live right now', value: data.liveStreams },
    { label: 'Completed this week', value: data.completedThisWeek },
  ];
  return (
    <div className="stats">
      {items.map((item) => (
        <div className="stat">
          <span className="stat-value">{item.value}</span>
          <span className="stat-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
