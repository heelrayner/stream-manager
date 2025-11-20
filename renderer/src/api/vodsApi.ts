import { ipc } from './ipcClient';

export const listVods = () => ipc.vods.list();
export const createVod = (payload: any) => ipc.vods.create(payload);
