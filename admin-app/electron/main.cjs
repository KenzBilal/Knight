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
  return { data: logCache, error: null };
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
      try {
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
          mainWindow.webContents.send('worker-log', msg);
        }
      } catch {}
    });

    workerProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (!msg) return;
      const logEntry = `[WORKER:ERR] ${msg}`;
      logCache.push(logEntry);
      if (logCache.length > MAX_LOG_CACHE) logCache.shift();
      try {
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
          mainWindow.webContents.send('worker-error', msg);
        }
      } catch {}
    });

    workerProcess.on('close', (code) => {
      const msg = `Worker exited with code ${code}`;
      LOG.warn(msg);
      logCache.push(`[WORKER:EXIT] ${msg}`);
      try {
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
          mainWindow.webContents.send('worker-status', msg);
        }
      } catch {}
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
  startDebugServer();
  startAutoTunnel();
  writeDebugFile();

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
  writeDebugFile();
});

app.on('window-all-closed', () => {
  // Don't quit — keep running in tray
  LOG.info('All windows closed, app stays in tray');
});

// ─── COMMAND SERVER ──────────────────────────────────────────────────────────
const commandRegistry = {};

function registerCommand(name, handler) {
  commandRegistry[name] = handler;
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ─── DEBUG LOG FILE ──────────────────────────────────────────────────────────
const debugLogPath = path.join(__dirname, '../../admin-debug.log');
const errorLog = [];
const MAX_ERROR_LOG = 500;

function writeDebugFile() {
  try {
    const lines = [
      `=== Knight Admin Debug Dump ===`,
      `Time: ${new Date().toISOString()}`,
      `Uptime: ${Math.floor(process.uptime())}s`,
      `Window: ${mainWindow ? (mainWindow.isDestroyed() ? 'destroyed' : 'exists') : 'null'}`,
      `Worker: ${workerProcess ? (workerProcess.exitCode === null ? `running (pid ${workerProcess.pid})` : `dead (code ${workerProcess.exitCode})`) : 'null'}`,
      `Supabase: ${_supabase ? 'connected' : 'null'}`,
      `Errors: ${errorLog.length}`,
      ``,
      `--- ERRORS ---`,
      ...errorLog.map(e => e),
      ``,
      `--- RECENT LOGS (last 100) ---`,
      ...logCache.slice(-100),
      ``,
      `--- ENV KEYS ---`,
      ...Object.keys(parseEnv(envPath)),
    ];
    fs.writeFileSync(debugLogPath, lines.join('\n'));
  } catch {}
}

// ─── GLOBAL ERROR HANDLERS ───────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  const msg = `[${new Date().toISOString()}] UNCAUGHT: ${err.message}\n${err.stack}`;
  LOG.error('UNCAUGHT EXCEPTION:', err.message);
  errorLog.push(msg);
  if (errorLog.length > MAX_ERROR_LOG) errorLog.shift();
  writeDebugFile();
});

process.on('unhandledRejection', (reason) => {
  const msg = `[${new Date().toISOString()}] UNHANDLED REJECTION: ${reason}`;
  LOG.error('UNHANDLED REJECTION:', reason);
  errorLog.push(msg);
  if (errorLog.length > MAX_ERROR_LOG) errorLog.shift();
  writeDebugFile();
});

// ─── COMMANDS: DB ────────────────────────────────────────────────────────────
registerCommand('db', async (args) => {
  const [action, table, ...rest] = args;
  if (!action || !table) return { ok: false, error: 'Usage: db <select|count|insert|update|delete> <table> [--where key=val] [--limit N] [--order col:asc|desc]' };

  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  // Parse flags
  const flags = {};
  const jsonParts = [];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--where' && rest[i + 1]) { flags.where = rest[i + 1]; i++; }
    else if (rest[i] === '--limit' && rest[i + 1]) { flags.limit = parseInt(rest[i + 1]); i++; }
    else if (rest[i] === '--order' && rest[i + 1]) { flags.order = rest[i + 1]; i++; }
    else if (rest[i] === '--select' && rest[i + 1]) { flags.select = rest[i + 1]; i++; }
    else if (rest[i] === '--count') { flags.count = true; }
    else { jsonParts.push(rest[i]); }
  }

  // Parse where clause
  let filters = {};
  if (flags.where) {
    for (const pair of flags.where.split(',')) {
      const [k, ...vParts] = pair.split('=');
      filters[k.trim()] = vParts.join('=').trim();
    }
  }

  // Parse JSON data for insert/update
  let jsonData = {};
  if (jsonParts.length > 0) {
    try { jsonData = JSON.parse(jsonParts.join(' ')); } catch { return { ok: false, error: 'Invalid JSON: ' + jsonParts.join(' ') }; }
  }

  const start = Date.now();
  try {
    let builder;
    if (action === 'select') {
      builder = supabase.from(table).select(flags.select || '*');
      for (const [k, v] of Object.entries(filters)) builder = builder.eq(k, v);
      if (flags.order) { const [col, dir] = flags.order.split(':'); builder = builder.order(col, { ascending: dir !== 'desc' }); }
      if (flags.limit) builder = builder.limit(flags.limit);
    } else if (action === 'count') {
      builder = supabase.from(table).select('*', { count: 'exact', head: true });
      for (const [k, v] of Object.entries(filters)) builder = builder.eq(k, v);
    } else if (action === 'insert') {
      builder = supabase.from(table).insert(jsonData).select();
    } else if (action === 'update') {
      builder = supabase.from(table).update(jsonData);
      for (const [k, v] of Object.entries(filters)) builder = builder.eq(k, v);
    } else if (action === 'delete') {
      builder = supabase.from(table).delete();
      for (const [k, v] of Object.entries(filters)) builder = builder.eq(k, v);
    } else {
      return { ok: false, error: 'Unknown db action: ' + action };
    }

    const { data, error, count } = await builder;
    if (error) return { ok: false, error: error.message, time: Date.now() - start };

    if (action === 'count') return { ok: true, count, time: Date.now() - start };
    const rows = Array.isArray(data) ? data : [];
    if (action === 'select') return { ok: true, count: rows.length, data: rows, time: Date.now() - start };
    return { ok: true, data, time: Date.now() - start };
  } catch (err) {
    return { ok: false, error: err.message, time: Date.now() - start };
  }
});

// ─── COMMANDS: WORKER ────────────────────────────────────────────────────────
registerCommand('worker', async (args) => {
  const [action] = args;
  if (action === 'status') {
    const running = workerProcess && workerProcess.exitCode === null;
    return {
      ok: true,
      running,
      pid: workerProcess?.pid || null,
      uptime: running ? Math.floor(process.uptime()) : 0,
      memory: running ? process.memoryUsage() : null,
    };
  }
  if (action === 'restart') {
    if (workerProcess) workerProcess.kill('SIGTERM');
    startWorker();
    return { ok: true, pid: workerProcess?.pid };
  }
  if (action === 'stop') {
    if (workerProcess) { workerProcess.kill('SIGTERM'); return { ok: true }; }
    return { ok: false, error: 'No worker running' };
  }
  if (action === 'start') {
    if (workerProcess && workerProcess.exitCode === null) return { ok: false, error: 'Worker already running' };
    startWorker();
    return { ok: true, pid: workerProcess?.pid };
  }
  return { ok: false, error: 'Usage: worker <status|start|stop|restart>' };
});

// ─── COMMANDS: USERS ─────────────────────────────────────────────────────────
registerCommand('users', async (args) => {
  const [action] = args;
  if (action !== 'list') return { ok: false, error: 'Usage: users list' };
  try {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Supabase not configured' };
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return { ok: false, error: error.message };
    return { ok: true, count: data.users.length, data: data.users.map(u => ({ id: u.id, email: u.email, created: u.created_at, last_sign_in: u.last_sign_in_at })) };
  } catch (err) { return { ok: false, error: err.message }; }
});

// ─── COMMANDS: ENV ───────────────────────────────────────────────────────────
registerCommand('env', async (args) => {
  const [action, ...rest] = args;
  if (action === 'get') {
    const env = parseEnv(envPath);
    const keys = rest.length > 0 ? rest : Object.keys(env);
    const result = {};
    for (const k of keys) result[k] = env[k] || '(not set)';
    return { ok: true, data: result };
  }
  if (action === 'set') {
    const env = parseEnv(envPath);
    for (const pair of rest) {
      const [k, ...vParts] = pair.split('=');
      if (k) env[k.trim()] = vParts.join('=').trim();
    }
    writeEnv(envPath, env);
    resetSupabase();
    return { ok: true };
  }
  if (action === 'list') {
    return { ok: true, data: Object.keys(parseEnv(envPath)) };
  }
  return { ok: false, error: 'Usage: env <get|set|list> [key] [value]' };
});

// ─── COMMANDS: ERRORS ────────────────────────────────────────────────────────
registerCommand('errors', async (args) => {
  const limit = parseInt(args[0]) || 20;
  return { ok: true, count: errorLog.length, data: errorLog.slice(-limit) };
});

// ─── COMMANDS: LOGS ──────────────────────────────────────────────────────────
registerCommand('logs', async (args) => {
  const [action, ...rest] = args;
  if (action === 'tail') {
    const n = parseInt(rest[0]) || 50;
    return { ok: true, count: logCache.length, data: logCache.slice(-n) };
  }
  if (action === 'clear') {
    logCache.length = 0;
    return { ok: true };
  }
  return { ok: true, count: logCache.length, data: logCache.slice(-50) };
});

// ─── COMMANDS: APP STATE ─────────────────────────────────────────────────────
registerCommand('state', async () => {
  return {
    ok: true,
    data: {
      window: mainWindow ? !mainWindow.isDestroyed() : false,
      workerRunning: workerProcess ? workerProcess.exitCode === null : false,
      workerPid: workerProcess?.pid || null,
      supabase: !!_supabase,
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      logCount: logCache.length,
      errorCount: errorLog.length,
    }
  };
});

// ─── COMMANDS: APP CONTROL ───────────────────────────────────────────────────
registerCommand('app', async (args) => {
  const [action] = args;
  if (action === 'quit') { isQuitting = true; app.quit(); return { ok: true }; }
  if (action === 'show') { mainWindow?.show(); return { ok: true }; }
  if (action === 'hide') { mainWindow?.hide(); return { ok: true }; }
  return { ok: false, error: 'Usage: app <quit|show|hide>' };
});

// ─── COMMANDS: SQL (raw) ────────────────────────────────────────────────────
registerCommand('sql', async (args) => {
  const query = args.join(' ');
  if (!query) return { ok: false, error: 'Usage: sql <raw SQL>' };
  try {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Supabase not configured' };
    const { data, error } = await supabase.rpc('query', { query_text: query }).single().catch(() => {
      return supabase.from(query.split(' ')[2] || '_').select('*').limit(1);
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  } catch (err) { return { ok: false, error: err.message }; }
});

// ─── COMMANDS: IPC (raw) ────────────────────────────────────────────────────
registerCommand('ipc', async (args) => {
  const [channel, ...rest] = args;
  if (!channel) return { ok: false, error: 'Usage: ipc <channel> [json_args]' };
  try {
    let payload = {};
    if (rest.length > 0) payload = JSON.parse(rest.join(' '));
    const result = await new Promise((resolve, reject) => {
      const event = { sender: mainWindow?.webContents };
      ipcMain.emit(channel, event, payload);
      setTimeout(() => resolve({ ok: true }), 100);
    });
    return result;
  } catch (err) { return { ok: false, error: err.message }; }
});

// ─── COMMAND DISPATCHER ──────────────────────────────────────────────────────
async function executeCommand(rawCmd) {
  const parts = rawCmd.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  LOG.ipc('cmd:', rawCmd);

  if (!cmd) return { ok: false, error: 'No command provided. Commands: ' + Object.keys(commandRegistry).join(', ') };
  if (!commandRegistry[cmd]) return { ok: false, error: `Unknown command: ${cmd}. Available: ${Object.keys(commandRegistry).join(', ')}` };

  try {
    return await commandRegistry[cmd](args);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── HTTP + WEBSOCKET SERVER ─────────────────────────────────────────────────
function startDebugServer() {
  try {
    const http = require('http');
    const WebSocket = require('ws');
    const PORT = 19822;

    const server = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') { res.writeHead(200); return res.end(); }

      if (req.method === 'GET') {
        if (req.url === '/screenshot') {
          if (mainWindow && !mainWindow.isDestroyed()) {
            try {
              const image = await mainWindow.webContents.capturePage();
              res.writeHead(200, { 'Content-Type': 'image/png' });
              return res.end(image.toPNG());
            } catch (err) { return json(res, 500, { ok: false, error: err.message }); }
          }
          return json(res, 404, { ok: false, error: 'No window' });
        }
        if (req.url === '/errors') return json(res, 200, { ok: true, count: errorLog.length, data: errorLog.slice(-50) });
        if (req.url === '/logs') return json(res, 200, { ok: true, count: logCache.length, data: logCache.slice(-200) });
        if (req.url === '/commands') return json(res, 200, { ok: true, commands: Object.keys(commandRegistry) });
        if (req.url === '/state') {
          return json(res, 200, {
            ok: true,
            data: {
              window: mainWindow ? !mainWindow.isDestroyed() : false,
              workerRunning: workerProcess ? workerProcess.exitCode === null : false,
              workerPid: workerProcess?.pid || null,
              supabase: !!_supabase,
              uptime: Math.floor(process.uptime()),
              logCount: logCache.length,
              errorCount: errorLog.length,
              commands: Object.keys(commandRegistry),
            }
          });
        }
        if (req.url.startsWith('/cmd')) {
          const url = new URL(req.url, `http://localhost:${PORT}`);
          const cmd = url.searchParams.get('cmd');
          if (!cmd) return json(res, 400, { ok: false, error: 'Missing ?cmd= parameter' });
          const result = await executeCommand(cmd);
          return json(res, result.ok ? 200 : 400, result);
        }
        return json(res, 200, {
          endpoints: {
            GET: ['/state', '/errors', '/logs', '/commands', '/screenshot', '/cmd?cmd=...'],
            POST: ['/cmd'],
            WebSocket: 'ws://host:19822',
          },
        });
      }

      if (req.method === 'POST' && req.url === '/cmd') {
        const body = await readBody(req);
        try {
          const { cmd } = JSON.parse(body);
          if (!cmd) return json(res, 400, { ok: false, error: 'Missing "cmd" field' });
          const result = await executeCommand(cmd);
          return json(res, result.ok ? 200 : 400, result);
        } catch (err) {
          return json(res, 400, { ok: false, error: 'Invalid JSON body: ' + err.message });
        }
      }

      json(res, 404, { ok: false, error: 'Not found' });
    });

    // ─── WebSocket: persistent shell connections ───────────────────────────
    const wss = new WebSocket.Server({ server });

    function broadcast(type, data) {
      const msg = JSON.stringify({ type, data });
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
      });
    }

    wss.on('connection', (ws) => {
      LOG.info('Shell connected');
      ws.on('message', async (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === 'cmd') {
            const result = await executeCommand(msg.cmd);
            ws.send(JSON.stringify({ type: 'result', id: msg.id, ...result }));
          } else if (msg.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', error: err.message }));
        }
      });
      ws.on('close', () => LOG.info('Shell disconnected'));
      ws.send(JSON.stringify({ type: 'welcome', commands: Object.keys(commandRegistry), uptime: Math.floor(process.uptime()) }));
    });

    // Make broadcast available globally for log forwarding
    global._wsBroadcast = broadcast;

    server.listen(PORT, '0.0.0.0', () => {
      LOG.ok(`Command server: http://0.0.0.0:${PORT} (HTTP + WebSocket)`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        LOG.warn(`Port ${PORT} in use, trying ${PORT + 1}`);
        server.listen(PORT + 1, '0.0.0.0');
      } else {
        LOG.error('Command server error:', err.message);
      }
    });
  } catch (err) {
    LOG.error('Failed to start command server:', err.message);
  }
}

LOG.info('IPC handlers registered, waiting for app ready...');

// ─── AUTO TUNNEL ────────────────────────────────────────────────────────────
function startAutoTunnel() {
  try {
    const { execFile } = require('child_process');
    LOG.info('Starting auto-tunnel (knight-admin-kenz.loca.lt)...');

    const tunnel = execFile('npx', ['localtunnel', '--port', '19822', '--subdomain', 'knight-admin-kenz'], {
      timeout: 30000,
    }, (err, stdout, stderr) => {
      if (err && err.killed) LOG.warn('Auto-tunnel process ended');
      if (stderr) LOG.warn('Tunnel stderr:', stderr.trim());
    });

    tunnel.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) {
        LOG.ok('Tunnel:', msg);
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
          try { mainWindow.webContents.send('worker-log', `[TUNNEL] ${msg}`); } catch {}
        }
      }
    });

    tunnel.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('WARN')) LOG.warn('Tunnel:', msg);
    });

    tunnel.on('close', (code) => {
      LOG.warn('Auto-tunnel exited with code', code);
    });

    LOG.ok('Auto-tunnel started');
  } catch (err) {
    LOG.warn('Auto-tunnel failed (non-critical):', err.message);
  }
}
