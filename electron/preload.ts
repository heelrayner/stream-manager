import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('streaman', {
  accounts: {
    get: () => ipcRenderer.invoke('accounts:get'),
    connect: (payload: any) => ipcRenderer.invoke('accounts:connect', payload),
    disconnect: (id: number) => ipcRenderer.invoke('accounts:disconnect', id),
  },
  schedules: {
    create: (payload: any) => ipcRenderer.invoke('schedules:create', payload),
    list: () => ipcRenderer.invoke('schedules:list'),
  },
  streams: {
    updateMetadata: (payload: any) => ipcRenderer.invoke('streams:updateMetadata', payload),
  },
  vods: {
    create: (payload: any) => ipcRenderer.invoke('vods:create', payload),
    list: () => ipcRenderer.invoke('vods:list'),
  },
  settings: {
    getSocial: () => ipcRenderer.invoke('settings:getSocial'),
    addSocial: (payload: any) => ipcRenderer.invoke('settings:addSocial', payload),
    updateSocial: (id: number, payload: any) => ipcRenderer.invoke('settings:updateSocial', id, payload),
    deleteSocial: (id: number) => ipcRenderer.invoke('settings:deleteSocial', id),
  },
  alerts: {
    list: () => ipcRenderer.invoke('alerts:list'),
    onNew: (cb: (alert: any) => void) => {
      const listener = (_event: unknown, data: any) => cb(data);
      ipcRenderer.on('alerts:new', listener);
      return () => ipcRenderer.removeListener('alerts:new', listener);
    },
  },
  highlights: {
    add: (payload: any) => ipcRenderer.invoke('highlights:add', payload),
    list: () => ipcRenderer.invoke('highlights:list'),
  },
});

export {}; // keep file a module
