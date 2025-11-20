import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import path from 'path';
import { createBackend, ConnectAccountPayload, ScheduleShortPayload, VodPayload, MetadataPayload } from '../backend/src/index';
import { logger } from '../backend/utils/logger';

let mainWindow: BrowserWindow | null = null;
const backend = createBackend();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const rendererUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(rendererUrl);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers() {
  ipcMain.handle('accounts:get', async () => backend.getAccounts());
  ipcMain.handle('accounts:connect', async (_event, payload: ConnectAccountPayload) => backend.connectAccount(payload));
  ipcMain.handle('accounts:disconnect', async (_event, accountId: number) => backend.disconnectAccount(accountId));

  ipcMain.handle('schedules:list', async () => backend.listShorts());
  ipcMain.handle('schedules:create', async (_event, payload: ScheduleShortPayload) => backend.scheduleShort(payload));

  ipcMain.handle('streams:updateMetadata', async (_event, payload: MetadataPayload) => backend.updateMetadata(payload));

  ipcMain.handle('vods:list', async () => backend.listVods());
  ipcMain.handle('vods:create', async (_event, payload: VodPayload) => backend.scheduleVod(payload));

  ipcMain.handle('settings:social:list', async () => backend.listSocialIntegrations());
  ipcMain.handle('settings:social:save', async (_event, integration) => backend.saveSocialIntegration(integration));
  ipcMain.handle('settings:social:delete', async (_event, id: number) => backend.deleteSocialIntegration(id));
  ipcMain.handle('settings:goLive', async (_event, message: string) => backend.postGoLiveMessage(message));

  ipcMain.handle('alerts:list', async () => backend.listAlerts());
  ipcMain.handle('alerts:simulate', async (_event, alert) => backend.addAlert(alert));
}

app.whenReady().then(() => {
  createWindow();
  registerIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

backend.on('alert', (alert) => {
  if (mainWindow) {
    mainWindow.webContents.send('alerts:new', alert);
  }
});

nativeTheme.themeSource = 'dark';
logger.info('Streaman main process started');
