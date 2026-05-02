import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('save-file', async (event, { fileName, content, filePath }) => {
  const fullPath = filePath || path.join(app.getPath('documents'), fileName);
  fs.writeFileSync(fullPath, Buffer.from(content));
  return fullPath;
});

ipcMain.handle('read-file', async (event, filePath) => {
  return fs.readFileSync(filePath);
});

ipcMain.handle('list-directory', async (event, dirPath) => {
  return fs.readdirSync(dirPath);
});

ipcMain.handle('create-directory', async (event, dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
  return true;
});

ipcMain.handle('delete-file', async (event, filePath) => {
  fs.unlinkSync(filePath);
  return true;
});

ipcMain.handle('move-file', async (event, { src, dest }) => {
  fs.renameSync(src, dest);
  return true;
});

ipcMain.handle('get-app-path', async () => {
  return app.getPath('documents');
});
