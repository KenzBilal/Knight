const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// ─── LOGGING ─────────────────────────────────────────────────────────────────
const LOG = {
  info: (...args) => console.log('[Admin]', new Date().toISOString(), '[INFO]', ...args),
  warn: (...args) => console.warn('[Admin]', new Date().toISOString(), '[WARN]', ...args),
  error: (...args) => console.error('[Admin]', new Date().toISOString(), '[ERROR]', ...args),
  ok: (...args) => console.log('[Admin]', new Date().toISOString(), '[OK]', ...args),
  ipc: (...args) => console.log('[Admin]', new Date().toISOString(), '[IPC]', ...args),
};

// ─── STATE ───────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let workerProcess = null;
let isQuitting = false;
const logCache = [];
const MAX_LOG_CACHE = 2000;

const envPath = path.join(__dirname, '../../worker/.env');
const isDev = process.env.NODE_ENV === 'development';

LOG.info('Main process starting...');
LOG.info('Env path:', envPath);
LOG.info('Dev mode:', isDev);

// ─── ENV UTILS ───────────────────────────────────────────────────────────────
function parseEnv(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      LOG.warn('Env file not found:', filePath);
      return {};
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) env[match[1].trim()] = match[2].trim();
    });
    LOG.ok('Parsed env:', Object.keys(env).join(', '));
    return env;
  } catch (err) {
    LOG.error('Failed to parse env:', err.message);
    return {};
  }
}

function writeEnv(filePath, envObj) {
  try {
    const lines = Object.entries(envObj).map(([k, v]) => `${k}=${v}`);
    fs.writeFileSync(filePath, lines.join('\n') + '\n');
    LOG.ok('Env saved to', filePath);
    return true;
  } catch (err) {
    LOG.error('Failed to save env:', err.message);
    return false;
  }
}

// ─── SUPABASE CLIENT ────────────────────────────────────────────────────────
let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const env = parseEnv(envPath);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    LOG.error('Missing Supabase credentials in', envPath);
    return null;
  }
  try {
    const { createClient } = require('@supabase/supabase-js');
    let WebSocket;
    try {
      WebSocket = require('ws');
    } catch {
      LOG.warn('ws module not found, realtime disabled');
    }
    const opts = {};
    if (WebSocket) opts.realtime = { transport: WebSocket };
    _supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, opts);
    LOG.ok('Supabase client created');
    return _supabase;
  } catch (err) {
    LOG.error('Failed to create Supabase client:', err.message);
    return null;
  }
}

function resetSupabase() {
  _supabase = null;
  LOG.info('Supabase client reset');
}

// ─── IPC: ENV ────────────────────────────────────────────────────────────────
ipcMain.handle('get-env', (event) => {
  LOG.ipc('get-env');
  return parseEnv(envPath);
});

ipcMain.handle('save-env', (event, envData) => {
  LOG.ipc('save-env', Object.keys(envData).length, 'keys');
  const ok = writeEnv(envPath, envData);
  resetSupabase();
  return { success: ok };
});

// ─── IPC: USERS ──────────────────────────────────────────────────────────────
ipcMain.handle('get-users', async (event) => {
  LOG.ipc('get-users');
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured — check worker/.env');
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    LOG.ok('get-users:', data.users?.length || 0, 'users');
    return { data: data.users, error: null };
  } catch (err) {
    LOG.error('get-users failed:', err.message);
    return { data: null, error: err.message };
  }
});

// ─── IPC: GENERIC DB QUERY ───────────────────────────────────────────────────
ipcMain.handle('db-query', async (event, query) => {
  const { table, action } = query;
  LOG.ipc('db-query', action, table);
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured — check worker/.env');

    const { filters, select, order, limit, offset, data, match } = query;
    let builder;

    if (action === 'select') {
      builder = supabase.from(table).select(select || '*');
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value === null) {
            builder = builder.is(key, null);
          } else if (typeof value === 'object' && value._op) {
            switch (value._op) {
              case 'eq': builder = builder.eq(key, value.value); break;
              case 'neq': builder = builder.neq(key, value.value); break;
              case 'gt': builder = builder.gt(key, value.value); break;
              case 'gte': builder = builder.gte(key, value.value); break;
              case 'lt': builder = builder.lt(key, value.value); break;
              case 'lte': builder = builder.lte(key, value.value); break;
              case 'like': builder = builder.like(key, value.value); break;
              case 'ilike': builder = builder.ilike(key, value.value); break;
              case 'in': builder = builder.in(key, value.value); break;
              default: builder = builder.eq(key, value.value);
            }
          } else {
            builder = builder.eq(key, value);
          }
        }
      }
      if (order) builder = builder.order(order.column, { ascending: order.ascending ?? false });
      if (limit) builder = builder.limit(limit);
      if (offset) builder = builder.range(offset, offset + (limit || 50) - 1);
    } else if (action === 'count') {
      builder = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          builder = builder.eq(key, value);
        }
      }
    } else if (action === 'insert') {
      builder = supabase.from(table).insert(data).select();
    } else if (action === 'update') {
      builder = supabase.from(table).update(data);
      if (match) {
        for (const [key, value] of Object.entries(match)) {
          builder = builder.eq(key, value);
        }
      }
    } else if (action === 'delete') {
      builder = supabase.from(table).delete();
      if (match) {
        for (const [key, value] of Object.entries(match)) {
          builder = builder.eq(key, value);
        }
      }
    }

    const { data: result, error, count } = await builder;

    if (error) throw error;

    if (action === 'count') {
      LOG.ok('db-query count:', table, '=', count);
      return { data: null, error: null, count: count || 0 };
    }

    const rows = Array.isArray(result) ? result.length : 0;
    LOG.ok('db-query', action, table, ':', rows, 'rows');
    return { data: result, error: null };
  } catch (err) {
    LOG.error('db-query failed:', action, table, '-', err.message);
    return { data: null, error: err.message };
  }
});

// ─── IPC: WORKER LOGS ────────────────────────────────────────────────────────
ipcMain.handle('get-logs', () => {
  LOG.ipc('get-logs', logCache.length, 'lines');
  return logCache;
});

// ─── IPC: WORKER STATUS ──────────────────────────────────────────────────────
ipcMain.handle('worker-status', () => {
  const running = workerProcess && workerProcess.exitCode === null;
  const status = {
    pid: workerProcess?.pid || null,
    uptime: running ? process.uptime() : 0,
    isRunning: running,
    memory: running ? process.memoryUsage() : null,
  };
  LOG.ipc('worker-status', running ? 'running' : 'stopped', 'pid:', status.pid);
  return status;
});

ipcMain.handle('worker-stop', () => {
  LOG.ipc('worker-stop');
  if (workerProcess) {
    try {
      workerProcess.kill('SIGTERM');
      LOG.ok('Worker process killed');
      return { success: true };
    } catch (err) {
      LOG.error('Failed to kill worker:', err.message);
      return { success: false, error: err.message };
    }
  }
  LOG.warn('No worker process to stop');
  return { success: false, error: 'No worker process' };
});

ipcMain.handle('worker-restart', () => {
  LOG.ipc('worker-restart');
  try {
    if (workerProcess) {
      workerProcess.kill('SIGTERM');
      LOG.info('Old worker killed');
    }
    startWorker();
    LOG.ok('Worker restarted');
    return { success: true };
  } catch (err) {
    LOG.error('Failed to restart worker:', err.message);
    return { success: false, error: err.message };
  }
});

// ─── WINDOW CONTROLS ─────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => {
  LOG.ipc('window-minimize');
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    LOG.ipc('window-restore');
    mainWindow.restore();
  } else {
    LOG.ipc('window-maximize');
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  LOG.ipc('window-close → hiding to tray');
  mainWindow?.hide();
});

// ─── WORKER PROCESS ──────────────────────────────────────────────────────────
function startWorker() {
  try {
    const workerPath = path.join(__dirname, '../../worker/start.js');
    if (!fs.existsSync(workerPath)) {
      LOG.error('Worker script not found:', workerPath);
      return;
    }
    LOG.info('Starting worker:', workerPath);
    workerProcess = spawn('node', [workerPath], {
      cwd: path.join(__dirname, '../../worker'),
      env: { ...process.env, FORCE_COLOR: '1' },
    });

    workerProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (!msg) return;
      const logEntry = `[WORKER] ${msg}`;
      logCache.push(logEntry);
      if (logCache.length > MAX_LOG_CACHE) logCache.shift();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('worker-log', msg);
      }
    });

    workerProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (!msg) return;
      const logEntry = `[WORKER:ERR] ${msg}`;
      logCache.push(logEntry);
      if (logCache.length > MAX_LOG_CACHE) logCache.shift();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('worker-error', msg);
      }
    });

    workerProcess.on('close', (code) => {
      const msg = `Worker exited with code ${code}`;
      LOG.warn(msg);
      logCache.push(`[WORKER:EXIT] ${msg}`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('worker-status', msg);
      }
    });

    workerProcess.on('error', (err) => {
      LOG.error('Worker spawn error:', err.message);
      logCache.push(`[WORKER:SPAWN_ERR] ${err.message}`);
    });

    LOG.ok('Worker started, pid:', workerProcess.pid);
  } catch (err) {
    LOG.error('Failed to start worker:', err.message);
  }
}

function stopWorker() {
  if (workerProcess) {
    LOG.info('Stopping worker...');
    try {
      workerProcess.kill('SIGTERM');
      workerProcess = null;
      LOG.ok('Worker stopped');
    } catch (err) {
      LOG.error('Error stopping worker:', err.message);
    }
  }
}

// ─── WINDOW ──────────────────────────────────────────────────────────────────
function createWindow() {
  LOG.info('Creating window...');
  try {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 600,
      title: 'Knight Admin Control Center',
      backgroundColor: '#121212',
      frame: false,
      titleBarStyle: 'hidden',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    mainWindow.once('ready-to-show', () => {
      LOG.ok('Window ready');
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      LOG.info('Window closed');
      mainWindow = null;
    });

    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  } catch (err) {
    LOG.error('Failed to create window:', err.message);
  }
}

// ─── TRAY ────────────────────────────────────────────────────────────────────
function createTray() {
  try {
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Knight Admin', click: () => mainWindow?.show() },
      { type: 'separator' },
      { label: 'Quit Knight Admin', click: () => { isQuitting = true; app.quit(); } },
    ]);
    tray.setToolTip('Knight Admin');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow?.show());
    LOG.ok('Tray created');
  } catch (err) {
    LOG.error('Failed to create tray:', err.message);
  }
}

// ─── APP LIFECYCLE ───────────────────────────────────────────────────────────
app.whenReady().then(() => {
  LOG.info('App ready');
  createWindow();
  createTray();
  startWorker();

  app.on('activate', () => {
    LOG.info('App activated');
    if (mainWindow) {
      mainWindow.show();
    } else {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  LOG.info('App quitting...');
  isQuitting = true;
  stopWorker();
});

app.on('window-all-closed', () => {
  // Don't quit — keep running in tray
  LOG.info('All windows closed, app stays in tray');
});

// ─── GLOBAL ERROR HANDLERS ───────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  LOG.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
  LOG.error('UNHANDLED REJECTION:', reason);
});

LOG.info('IPC handlers registered, waiting for app ready...');
