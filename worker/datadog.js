// Knight worker/datadog.js
// Lightweight Datadog Logs API integration (zero packages)

const DD_API_KEY = process.env.DATADOG_API_KEY;
const DD_SITE = process.env.DATADOG_SITE || 'datadoghq.com';
const DD_SERVICE = 'knight-worker';
const DD_ENV = process.env.NODE_ENV || 'production';

const DD_URL = `https://http-intake.logs.${DD_SITE}/api/v2/logs`;

let _buffer = [];
let _flushTimer = null;
const FLUSH_INTERVAL_MS = 5000;
const MAX_BUFFER_SIZE = 100;

function formatLog(level, msg, extra = {}) {
  return {
    ddsource: 'nodejs',
    service: DD_SERVICE,
    env: DD_ENV,
    level,
    message: msg,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

async function flush() {
  if (_buffer.length === 0) return;
  const batch = _buffer.splice(0, MAX_BUFFER_SIZE);

  try {
    await fetch(DD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': DD_API_KEY,
      },
      body: JSON.stringify(batch),
    });
  } catch (err) {
    // Silent fail — don't crash worker over logging
  }
}

function startFlushTimer() {
  if (_flushTimer) return;
  _flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);
}

function log(level, msg, extra) {
  if (!DD_API_KEY) return; // No key = no logging
  _buffer.push(formatLog(level, msg, extra));
  startFlushTimer();

  // Also flush immediately if buffer is large
  if (_buffer.length >= MAX_BUFFER_SIZE) {
    flush();
  }
}

// Export convenience methods
export const datadog = {
  info: (msg, extra) => log('info', msg, extra),
  warn: (msg, extra) => log('warn', msg, extra),
  error: (msg, extra) => log('error', msg, extra),
  debug: (msg, extra) => log('debug', msg, extra),
  flush,
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  clearInterval(_flushTimer);
  await flush();
});

process.on('SIGINT', async () => {
  clearInterval(_flushTimer);
  await flush();
});
