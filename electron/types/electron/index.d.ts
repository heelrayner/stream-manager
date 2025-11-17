declare module 'electron' {
  export interface BrowserWindowConstructorOptions {
    width?: number;
    height?: number;
    webPreferences?: {
      contextIsolation?: boolean;
    };
    title?: string;
  }

  export class BrowserWindow {
    constructor(options?: BrowserWindowConstructorOptions);
    loadURL(url: string): Promise<void>;
    static getAllWindows(): BrowserWindow[];
  }

  export const app: {
    whenReady(): Promise<void>;
    on(event: 'window-all-closed' | 'before-quit' | 'activate', listener: (...args: any[]) => void): void;
    quit(): void;
  };

  export const dialog: {
    showErrorBox(title: string, content: string): void;
  };
}
