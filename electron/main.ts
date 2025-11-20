import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { backendApi, initBackend, alertsEmitter } from '../backend/src';

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, isDev ? 'preload.ts' : 'preload.js'),
    },
    title: 'streaman',
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const rendererPath = path.resolve(__dirname, '..', '..', 'renderer', 'dist', 'index.html');
    await mainWindow.loadFile(rendererPath);
  }

  alertsEmitter.on('alert', (alert) => {
    mainWindow?.webContents.send('alerts:new', alert);
  });
}

app.whenReady().then(async () => {
  await initBackend();
  await createWindow();

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

ipcMain.handle('accounts:get', () => backendApi.getAccounts());
ipcMain.handle('accounts:connect', (_event, payload) => backendApi.connectAccount(payload));
ipcMain.handle('accounts:disconnect', (_event, id: number) => backendApi.disconnectAccount(id));

ipcMain.handle('schedules:create', (_event, payload) => backendApi.scheduleShort(payload));
ipcMain.handle('schedules:list', () => backendApi.listShortSchedules());

ipcMain.handle('streams:updateMetadata', (_event, payload) => backendApi.updateStreamMetadata(payload));

ipcMain.handle('vods:create', (_event, payload) => backendApi.scheduleVod(payload));
ipcMain.handle('vods:list', () => backendApi.listVodUploads());

ipcMain.handle('alerts:list', () => backendApi.getAlerts());

ipcMain.handle('settings:getSocial', () => backendApi.getSocialIntegrations());
ipcMain.handle('settings:addSocial', (_event, payload) => backendApi.addSocialIntegration(payload));
ipcMain.handle('settings:updateSocial', (_event, id: number, payload) => backendApi.updateSocialIntegration(id, payload));
ipcMain.handle('settings:deleteSocial', (_event, id: number) => backendApi.deleteSocialIntegration(id));

ipcMain.handle('highlights:add', (_event, payload) => backendApi.addHighlight(payload.label, payload.timestamp, payload.note));
ipcMain.handle('highlights:list', () => backendApi.listHighlights());
