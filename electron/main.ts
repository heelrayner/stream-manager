import { app, BrowserWindow, dialog } from 'electron';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import { join } from 'node:path';
import { request } from 'node:http';
import { existsSync } from 'node:fs';

let serverProcess: ChildProcessWithoutNullStreams | null = null;
const startUrl = process.env.APP_URL || 'http://localhost:4000';
const healthUrl = new URL('/api/health', startUrl).toString();

function startServer(): void {
  if (serverProcess) return;
  const serverEntry = join(process.cwd(), 'dist', 'server', 'index.js');
  if (!existsSync(serverEntry)) {
    throw new Error('Server bundle missing. Run "npm run build" first.');
  }
  serverProcess = spawn(process.execPath, [serverEntry], {
    env: { ...process.env },
    stdio: 'inherit',
  });

  serverProcess.on('exit', (code, signal) => {
    serverProcess = null;
    if (code && code !== 0) {
      console.error(`Stream Manager API exited with code ${code}`);
    }
    if (signal) {
      console.warn(`Stream Manager API stopped via signal ${signal}`);
    }
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

async function waitForServer(url: string, attempts = 30, delayMs = 300): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    const isReady = await new Promise<boolean>((resolve) => {
      const req = request(url, { method: 'GET' }, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.end();
    });

    if (isReady) return;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error('Timed out waiting for the local API to start');
}

async function createWindow() {
  try {
    startServer();
    await waitForServer(healthUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown startup failure';
    dialog.showErrorBox('Stream Manager failed to start', message);
    app.quit();
    return;
  }

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
    title: 'Stream Manager',
  });

  await mainWindow.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
