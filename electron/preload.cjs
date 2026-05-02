const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  listDirectory: (dirPath) => ipcRenderer.invoke('list-directory', dirPath),
  createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  moveFile: (data) => ipcRenderer.invoke('move-file', data),
  getAppPath: () => ipcRenderer.invoke('get-app-path')
});
