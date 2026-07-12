const { contextBridge, ipcRenderer } = require('electron');

function safeInvoke(channel, ...args) {
  return ipcRenderer.invoke(channel, ...args).catch(err => {
    console.error(`[Preload] IPC ${channel} failed:`, err.message || err);
    return { data: null, error: err.message || String(err) };
  });
}

function safeSend(channel, ...args) {
  try {
    ipcRenderer.send(channel, ...args);
  } catch (err) {
    console.error(`[Preload] IPC ${channel} send failed:`, err.message || err);
  }
}

const api = {
  // Log streaming
  onWorkerLog: (cb) => {
    const handler = (_e, v) => { try { cb(v); } catch (err) { console.error('[Preload] onWorkerLog callback error:', err); } };
    ipcRenderer.on('worker-log', handler);
    return () => ipcRenderer.removeListener('worker-log', handler);
  },
  onWorkerError: (cb) => {
    const handler = (_e, v) => { try { cb(v); } catch (err) { console.error('[Preload] onWorkerError callback error:', err); } };
    ipcRenderer.on('worker-error', handler);
    return () => ipcRenderer.removeListener('worker-error', handler);
  },
  onWorkerStatus: (cb) => {
    const handler = (_e, v) => { try { cb(v); } catch (err) { console.error('[Preload] onWorkerStatus callback error:', err); } };
    ipcRenderer.on('worker-status', handler);
    return () => ipcRenderer.removeListener('worker-status', handler);
  },

  // Window controls
  windowMinimize: () => safeSend('window-minimize'),
  windowMaximize: () => safeSend('window-maximize'),
  windowClose: () => safeSend('window-close'),

  // Env
  getEnv: () => safeInvoke('get-env'),
  saveEnv: (data) => safeInvoke('save-env', data),

  // Users
  getUsers: () => safeInvoke('get-users'),

  // Logs
  getLogs: () => safeInvoke('get-logs'),

  // DB
  dbQuery: (query) => safeInvoke('db-query', query),

  // Worker
  workerStatus: () => safeInvoke('worker-status'),
  workerRestart: () => safeInvoke('worker-restart'),
  workerStop: () => safeInvoke('worker-stop'),

  // Notifications (native OS)
  showNotification: (title, body, options) => safeInvoke('show-notification', { title, body, options }),

  // Sounds
  playSound: (name) => safeInvoke('play-sound', { name }),

  // App info
  getAppInfo: () => safeInvoke('get-app-info'),

  // Open external URL
  openExternal: (url) => safeInvoke('open-external', url),

  // Toggle logs (event from main process)
  onToggleLogs: (cb) => {
    const handler = () => { try { cb(); } catch (err) { console.error('[Preload] onToggleLogs callback error:', err); } };
    ipcRenderer.on('toggle-logs', handler);
    return () => ipcRenderer.removeListener('toggle-logs', handler);
  },
};

try {
  contextBridge.exposeInMainWorld('electronAPI', api);
} catch (e) {
  // contextIsolation is false, so this is expected
}

window.electronAPI = api;
window.ipcRenderer = ipcRenderer;

console.log('[Preload] electronAPI ready — Knight v1.0.0');
