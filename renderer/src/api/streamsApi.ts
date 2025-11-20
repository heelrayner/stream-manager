import { ipc } from './ipcClient';

export const updateMetadata = (payload: any) => ipc.streams.updateMetadata(payload);
