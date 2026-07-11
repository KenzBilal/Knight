const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

let mainWindow;
let tray;
let workerProcess;

const envPath = path.join(__dirname, '../../worker/.env');

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
  return env;
}

function writeEnv(filePath, envObj) {
  const lines = Object.entries(envObj).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const env = parseEnv(envPath);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const WebSocket = require('ws');
  _supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    realtime: { transport: WebSocket }
  });
  return _supabase;
}

// ─── ENV ─────────────────────────────────────────────────────────────────────
ipcMain.handle('get-env', () => parseEnv(envPath));
ipcMain.handle('save-env', (event, envData) => {
  writeEnv(envPath, envData);
  return { success: true };
});

// ─── USERS ───────────────────────────────────────────────────────────────────
ipcMain.handle('get-users', async () => {
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    return { data: data.users, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
});

// ─── GENERIC DB QUERY ────────────────────────────────────────────────────────
ipcMain.handle('db-query', async (event, query) => {
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not configured');

    const { table, action, filters, select, order, limit, offset, data, match } = query;

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
      return { data: null, error: null, count: count || 0 };
    }

    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
});

// ─── WORKER CONTROL ──────────────────────────────────────────────────────────
let logCache = [];
ipcMain.handle('get-logs', () => logCache);

ipcMain.handle('worker-status', () => {
  if (!workerProcess) return { pid: null, uptime: 0, isRunning: false, memory: null };
  return {
    pid: workerProcess.pid,
    uptime: process.uptime(),
    isRunning: workerProcess.exitCode === null,
    memory: process.memoryUsage(),
  };
});

ipcMain.handle('worker-stop', () => {
  if (workerProcess) {
    workerProcess.kill('SIGTERM');
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('worker-restart', () => {
  if (workerProcess) {
    workerProcess.kill('SIGTERM');
  }
  startWorker();
  return { success: true };
});

// ─── LOG STREAMING ───────────────────────────────────────────────────────────
function startWorker() {
  const workerPath = path.join(__dirname, '../../worker/start.js');
  workerProcess = spawn('node', [workerPath], {
    cwd: path.join(__dirname, '../../worker'),
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  workerProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    logCache.push(msg);
    if (logCache.length > 1000) logCache.shift();
    if (mainWindow) mainWindow.webContents.send('worker-log', msg);
  });

  workerProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    logCache.push(`[ERROR] ${msg}`);
    if (logCache.length > 1000) logCache.shift();
    if (mainWindow) mainWindow.webContents.send('worker-error', msg);
  });

  workerProcess.on('close', (code) => {
    const msg = `Exited with code ${code}`;
    logCache.push(`[STATUS] ${msg}`);
    if (mainWindow) mainWindow.webContents.send('worker-status', msg);
  });
}

// ─── WINDOW ──────────────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.restore();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'Knight Admin Control Center',
    backgroundColor: '#121212',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Admin Center', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Knight Admin');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow.show());
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  startWorker();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (workerProcess) workerProcess.kill();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
