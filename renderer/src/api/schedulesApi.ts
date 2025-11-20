import { invoke } from './ipcClient';

export interface SchedulePayload {
  title: string;
  description: string;
  tags: string[];
  videoPath: string;
  scheduledTime: string;
  platform: string;
  accountId?: number;
}

export function listSchedules() {
  return invoke<any>('listSchedules');
}

export function createSchedule(payload: SchedulePayload) {
  return invoke('createSchedule', payload);
}
