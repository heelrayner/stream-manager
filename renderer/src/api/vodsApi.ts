import { invoke } from './ipcClient';

export interface VodPayload {
  title: string;
  description: string;
  tags: string[];
  videoPath: string;
  scheduledTime: string;
  platform: string;
  accountId?: number;
}

export function listVods() {
  return invoke<any>('listVods');
}

export function createVod(payload: VodPayload) {
  return invoke('createVod', payload);
}
