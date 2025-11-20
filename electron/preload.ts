import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getAccounts: () => ipcRenderer.invoke('accounts:get'),
  connectAccount: (payload: unknown) => ipcRenderer.invoke('accounts:connect', payload),
  disconnectAccount: (accountId: number) => ipcRenderer.invoke('accounts:disconnect', accountId),
  listSchedules: () => ipcRenderer.invoke('schedules:list'),
  createSchedule: (payload: unknown) => ipcRenderer.invoke('schedules:create', payload),
  updateStreamMetadata: (payload: unknown) => ipcRenderer.invoke('streams:updateMetadata', payload),
  listVods: () => ipcRenderer.invoke('vods:list'),
  createVod: (payload: unknown) => ipcRenderer.invoke('vods:create', payload),
  listSocialIntegrations: () => ipcRenderer.invoke('settings:social:list'),
  saveSocialIntegration: (payload: unknown) => ipcRenderer.invoke('settings:social:save', payload),
  deleteSocialIntegration: (id: number) => ipcRenderer.invoke('settings:social:delete', id),
  goLive: (message: string) => ipcRenderer.invoke('settings:goLive', message),
  listAlerts: () => ipcRenderer.invoke('alerts:list'),
  simulateAlert: (payload: unknown) => ipcRenderer.invoke('alerts:simulate', payload),
  onAlert: (callback: (alert: unknown) => void) => {
    ipcRenderer.on('alerts:new', (_event, alert) => callback(alert));
    return () => ipcRenderer.removeAllListeners('alerts:new');
  }
});

declare global {
  interface Window {
    api: {
      getAccounts: () => Promise<unknown>;
      connectAccount: (payload: unknown) => Promise<unknown>;
      disconnectAccount: (accountId: number) => Promise<unknown>;
      listSchedules: () => Promise<unknown>;
      createSchedule: (payload: unknown) => Promise<unknown>;
      updateStreamMetadata: (payload: unknown) => Promise<unknown>;
      listVods: () => Promise<unknown>;
      createVod: (payload: unknown) => Promise<unknown>;
      listSocialIntegrations: () => Promise<unknown>;
      saveSocialIntegration: (payload: unknown) => Promise<unknown>;
      deleteSocialIntegration: (id: number) => Promise<unknown>;
      goLive: (message: string) => Promise<unknown>;
      listAlerts: () => Promise<unknown>;
      simulateAlert: (payload: unknown) => Promise<unknown>;
      onAlert: (callback: (alert: unknown) => void) => () => void;
    };
  }
}
