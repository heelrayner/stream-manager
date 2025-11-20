import { ipc } from './ipcClient';

export const getAccounts = () => ipc.accounts.get();
export const connectAccount = (payload: any) => ipc.accounts.connect(payload);
export const disconnectAccount = (id: number) => ipc.accounts.disconnect(id);
