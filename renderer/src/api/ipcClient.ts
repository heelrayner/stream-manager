export type StreamanApi = typeof window.streaman;

declare global {
  interface Window {
    streaman: {
      accounts: {
        get: () => Promise<any[]>;
        connect: (payload: any) => Promise<any>;
        disconnect: (id: number) => Promise<boolean>;
      };
      schedules: {
        create: (payload: any) => Promise<any>;
        list: () => Promise<any[]>;
      };
      streams: {
        updateMetadata: (payload: any) => Promise<any>;
      };
      vods: {
        create: (payload: any) => Promise<any>;
        list: () => Promise<any[]>;
      };
      settings: {
        getSocial: () => Promise<any[]>;
        addSocial: (payload: any) => Promise<any>;
        updateSocial: (id: number, payload: any) => Promise<any>;
        deleteSocial: (id: number) => Promise<boolean>;
      };
      alerts: {
        list: () => Promise<any[]>;
        onNew: (cb: (alert: any) => void) => () => void;
      };
      highlights: {
        add: (payload: any) => Promise<any>;
        list: () => Promise<any[]>;
      };
    };
  }
}

export const ipc = window.streaman;
