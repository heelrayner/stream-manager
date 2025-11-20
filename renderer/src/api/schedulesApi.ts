import { ipc } from './ipcClient';

export const listSchedules = () => ipc.schedules.list();
export const createSchedule = (payload: any) => ipc.schedules.create(payload);
