import { invoke } from './ipcClient';

export interface MetadataPayload {
  title: string;
  category: string;
  game: string;
  accountIds: number[];
}

export function updateMetadata(payload: MetadataPayload) {
  return invoke('updateStreamMetadata', payload);
}
