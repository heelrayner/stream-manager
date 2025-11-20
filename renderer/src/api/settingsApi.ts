import { invoke } from './ipcClient';

export function listSocialIntegrations() {
  return invoke<any>('listSocialIntegrations');
}

export function saveSocialIntegration(payload: any) {
  return invoke('saveSocialIntegration', payload);
}

export function deleteSocialIntegration(id: number) {
  return invoke('deleteSocialIntegration', id);
}

export function goLive(message: string) {
  return invoke('goLive', message);
}
