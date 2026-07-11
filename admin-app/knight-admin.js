#!/usr/bin/env node

const http = require('http');

const SERVER = process.env.KNIGHT_SERVER || 'http://localhost:19822';

function usage() {
  console.log(`
Knight Admin CLI — Control the app from terminal

  Usage:  knight-admin <command> [args...]

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

async function run(cmdStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER + '/cmd');
    const postData = JSON.stringify({ cmd: cmdStr });

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/cmd',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 15000,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ ok: false, error: 'Invalid response: ' + body });
        }
      });
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        resolve({ ok: false, error: `Cannot connect to ${SERVER} — is Knight Admin running?` });
      } else {
        resolve({ ok: false, error: err.message });
      }
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Request timed out (15s)' });
    });

    req.write(postData);
    req.end();
  });
}

function formatTable(data) {
  if (!Array.isArray(data) || data.length === 0) return '(empty)';
  const keys = [...new Set(data.flatMap(Object.keys))];
  const widths = {};
  for (const k of keys) widths[k] = Math.max(k.length, ...data.map(r => String(r[k] ?? '').slice(0, 50).length));
  const header = keys.map(k => k.padEnd(widths[k])).join('  ');
  const sep = keys.map(k => '-'.repeat(widths[k])).join('  ');
  const rows = data.map(r => keys.map(k => String(r[k] ?? '').slice(0, 50).padEnd(widths[k])).join('  '));
  return [header, sep, ...rows].join('\n');
}

function printResult(result) {
  if (!result.ok) {
    console.error('ERROR:', result.error);
    process.exit(1);
  }

  if (result.data !== undefined) {
    const data = result.data;

    // Print as table if array of objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      console.log(formatTable(data));
    } else if (Array.isArray(data)) {
      for (const item of data) console.log(typeof item === 'object' ? JSON.stringify(item) : item);
    } else if (typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'object' && v !== null) {
          console.log(`${k}:`);
          for (const [k2, v2] of Object.entries(v)) console.log(`  ${k2}: ${v2}`);
        } else {
          console.log(`${k}: ${v}`);
        }
      }
    } else {
      console.log(data);
    }
  }

  if (result.count !== undefined) console.log(`(${result.count} rows)`);
  if (result.time !== undefined) console.log(`[${result.time}ms]`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    usage();
    return;
  }

  // Build command string
  let cmdStr;
  if (args[0] === 'raw') {
    cmdStr = args.slice(1).join(' ');
  } else {
    cmdStr = args.join(' ');
  }

  // Handle screenshot specially
  if (args[0] === 'screenshot') {
    const url = new URL(SERVER + '/screenshot');
    const file = args[1] || 'screenshot.png';
    const fs = require('fs');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: '/screenshot',
      method: 'GET',
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => { console.error('ERROR:', body); process.exit(1); });
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        fs.writeFileSync(file, Buffer.concat(chunks));
        console.log(`Screenshot saved: ${file}`);
      });
    });
    req.on('error', (err) => { console.error('ERROR:', err.message); process.exit(1); });
    req.end();
    return;
  }

  const result = await run(cmdStr);
  printResult(result);
}

main();
