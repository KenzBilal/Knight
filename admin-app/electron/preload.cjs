const { contextBridge, ipcRenderer } = require('electron');

const api = {
  onWorkerLog: (cb) => ipcRenderer.on('worker-log', (_e, v) => cb(v)),
  onWorkerError: (cb) => ipcRenderer.on('worker-error', (_e, v) => cb(v)),
  onWorkerStatus: (cb) => ipcRenderer.on('worker-status', (_e, v) => cb(v)),
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  getEnv: () => ipcRenderer.invoke('get-env'),
  saveEnv: (data) => ipcRenderer.invoke('save-env', data),
  getUsers: () => ipcRenderer.invoke('get-users'),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  dbQuery: (query) => ipcRenderer.invoke('db-query', query),
  workerStatus: () => ipcRenderer.invoke('worker-status'),
  workerRestart: () => ipcRenderer.invoke('worker-restart'),
  workerStop: () => ipcRenderer.invoke('worker-stop'),
};

try {
  contextBridge.exposeInMainWorld('electronAPI', api);
} catch (e) {}

window.electronAPI = api;
window.ipcRenderer = ipcRenderer;
