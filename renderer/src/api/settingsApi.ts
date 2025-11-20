import { ipc } from './ipcClient';

export const listIntegrations = () => ipc.settings.getSocial();
export const addIntegration = (payload: any) => ipc.settings.addSocial(payload);
export const updateIntegration = (id: number, payload: any) => ipc.settings.updateSocial(id, payload);
export const deleteIntegration = (id: number) => ipc.settings.deleteSocial(id);
