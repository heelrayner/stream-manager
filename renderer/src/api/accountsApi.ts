import { invoke } from './ipcClient';

export interface AccountPayload {
  platform: string;
  externalId: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  scopes: string[];
}

export function getAccounts() {
  return invoke<any>('getAccounts');
}

export function connectAccount(payload: AccountPayload) {
  return invoke('connectAccount', payload);
}

export function disconnectAccount(id: number) {
  return invoke('disconnectAccount', id);
}
