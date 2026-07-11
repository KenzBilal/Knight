#!/usr/bin/env node

const http = require('http');

const SERVER = process.env.KNIGHT_SERVER || 'https://knight-admin-kenz.loca.lt';

function usage() {
  console.log(`
Knight Admin CLI — Control the app from terminal

  Usage:  knight-admin <command> [args...]
          knight-admin shell              (interactive WebSocket mode)

  Commands:
    db select <table> [--where key=val] [--limit N] [--order col:asc|desc]
    db count <table> [--where key=val]
    db insert <table> '{"key":"val",...}'
    db update <table> '{"key":"new_val"}' [--where id=X]
    db delete <table> [--where id=X]

    worker status | start | stop | restart

    users list

    env get [KEY...]       (no args = all keys)
    env set KEY=VALUE...
    env list

    errors [N]             (last N errors, default 20)
    logs [tail|clear] [N]  (last 50 by default)

    state                  (app state summary)
    app quit | show | hide
    screenshot             (save to screenshot.png)

    raw <cmd>              (send any command string)
  `);
}

function formatTable(data) {
  if (!Array.isArray(data) || data.length === 0) return '(empty)';
  const keys = [...new Set(data.flatMap(Object.keys))];
  const widths = {};
  for (const k of keys) widths[k] = Math.max(k.length, ...data.map(r => String(r[k] ?? '').slice(0, 60).length));
  const header = keys.map(k => k.padEnd(widths[k])).join('  ');
  const sep = keys.map(k => '-'.repeat(widths[k])).join('  ');
  const rows = data.map(r => keys.map(k => String(r[k] ?? '').slice(0, 60).padEnd(widths[k])).join('  '));
  return [header, sep, ...rows].join('\n');
}

function printResult(result) {
  if (!result.ok) {
    console.error('ERROR:', result.error);
    return;
  }

  if (result.data !== undefined) {
    const data = result.data;
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      console.log(formatTable(data));
    } else if (Array.isArray(data)) {
      for (const item of data) console.log(typeof item === 'object' ? JSON.stringify(item) : item);
    } else if (typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'object' && v !== null) console.log(`${k}:\n${Object.entries(v).map(([k2,v2]) => `  ${k2}: ${v2}`).join('\n')}`);
        else console.log(`${k}: ${v}`);
      }
    } else {
      console.log(data);
    }
  }

  if (result.count !== undefined) console.log(`(${result.count} rows)`);
  if (result.time !== undefined) console.log(`[${result.time}ms]`);
}

// ─── HTTP single-shot mode ───────────────────────────────────────────────────
async function runHttp(cmdStr) {
  return new Promise((resolve) => {
    const url = new URL(SERVER + '/cmd');
    const postData = JSON.stringify({ cmd: cmdStr });
    const options = {
      hostname: url.hostname, port: url.port, path: '/cmd', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
      timeout: 15000,
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({ ok: false, error: 'Invalid response' }); } });
    });
    req.on('error', (err) => {
      resolve({ ok: false, error: err.code === 'ECONNREFUSED' ? `Cannot connect to ${SERVER} — is Knight Admin running?` : err.message });
    });
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timed out (15s)' }); });
    req.write(postData);
    req.end();
  });
}

// ─── WebSocket shell mode ────────────────────────────────────────────────────
function runShell() {
  let WebSocket;
  try { WebSocket = require('ws'); } catch {
    console.error('WebSocket requires "ws" package. Run: npm install ws');
    process.exit(1);
  }

  const wsUrl = SERVER.replace(/^http/, 'ws');
  let ws;
  let pending = new Map();
  let msgId = 0;
  let reconnectTimer;
  let liveLogs = false;

  function connect() {
    process.stdout.write(`\x1b[2mConnecting to ${wsUrl}...\x1b[0m\n`);

    ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      process.stdout.write(`\x1b[32mConnected to Knight Admin\x1b[0m\n`);
      process.stdout.write(`\x1b[2mType commands or 'help'. 'live' to toggle live logs. Ctrl+C to exit.\x1b[0m\n\n`);
      prompt();
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'result') {
          const p = pending.get(msg.id);
          if (p) { pending.delete(msg.id); p.resolve(msg); }
        } else if (msg.type === 'welcome') {
          // Already handled in 'open'
        } else if (msg.type === 'log' || msg.type === 'warn' || msg.type === 'error') {
          if (liveLogs) {
            const color = msg.type === 'error' ? '\x1b[31m' : msg.type === 'warn' ? '\x1b[33m' : '\x1b[2m';
            process.stdout.write(`${color}[${msg.type}] ${msg.data}\x1b[0m\n`);
          }
        }
      } catch {}
    });

    ws.on('close', () => {
      process.stdout.write(`\x1b[31mDisconnected\x1b[0m\n`);
      scheduleReconnect();
    });

    ws.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') process.stdout.write(`\x1b[31mError: ${err.message}\x1b[0m\n`);
    });
  }

  function scheduleReconnect() {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      process.stdout.write(`\x1b[2mReconnecting...\x1b[0m\n`);
      connect();
    }, 3000);
  }

  function send(cmdStr) {
    return new Promise((resolve) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        resolve({ ok: false, error: 'Not connected' });
        return;
      }
      const id = ++msgId;
      pending.set(id, { resolve });
      ws.send(JSON.stringify({ type: 'cmd', id, cmd: cmdStr }));
      setTimeout(() => { if (pending.has(id)) { pending.delete(id); resolve({ ok: false, error: 'Timed out' }); } }, 15000);
    });
  }

  function prompt() {
    process.stdout.write(`\x1b[36mknight>\x1b[0m `);
  }

  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });

  rl.on('line', async (line) => {
    const cmd = line.trim();
    if (!cmd) { prompt(); return; }

    if (cmd === 'exit' || cmd === 'quit') { rl.close(); ws.close(); process.exit(0); }

    if (cmd === 'help') {
      console.log(`
  Commands:
    db select <table> [--where key=val] [--limit N] [--order col:asc|desc]
    db count <table> [--where key=val]
    db insert <table> '{"key":"val",...}'
    db update <table> '{"key":"new_val"}' [--where id=X]
    db delete <table> [--where id=X]
    worker status | start | stop | restart
    users list
    env get [KEY...] | env set K=V... | env list
    errors [N] | logs [tail|clear] [N]
    state | app quit | show | hide
    live                (toggle live log stream)
    reconnect           (reconnect WebSocket)
    exit / quit
      `);
      prompt();
      return;
    }

    if (cmd === 'live') {
      liveLogs = !liveLogs;
      console.log(`Live logs: ${liveLogs ? '\x1b[32mON\x1b[0m' : '\x1b[2mOFF\x1b[0m'}`);
      prompt();
      return;
    }

    if (cmd === 'reconnect') {
      ws.close();
      connect();
      return;
    }

    const result = await send(cmd);
    printResult(result);
    prompt();
  });

  rl.on('close', () => { ws.close(); process.exit(0); });

  connect();
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') { usage(); return; }

  // Shell mode
  if (args[0] === 'shell') { runShell(); return; }

  // Screenshot (special: binary download)
  if (args[0] === 'screenshot') {
    const file = args[1] || 'screenshot.png';
    const fs = require('fs');
    const url = new URL(SERVER + '/screenshot');
    const options = { hostname: url.hostname, port: url.port, path: '/screenshot', method: 'GET', timeout: 10000 };
    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{console.error('ERROR:',b);process.exit(1);}); return; }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => { fs.writeFileSync(file, Buffer.concat(chunks)); console.log(`Saved: ${file}`); });
    });
    req.on('error', (err) => { console.error('ERROR:', err.message); process.exit(1); });
    req.end();
    return;
  }

  const result = await runHttp(args.join(' '));
  printResult(result);
  if (!result.ok) process.exit(1);
}

main();
