// Structured logging for debugging and monitoring

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: string;
}

const DD_API_KEY = process.env.DATADOG_API_KEY;
const DD_SITE = process.env.DATADOG_SITE || "datadoghq.com";
const DD_SERVICE = "knight-dashboard";
const DD_URL = `https://http-intake.logs.${DD_SITE}/api/v2/logs`;

const _buffer: LogEntry[] = [];
let _flushTimer: ReturnType<typeof setInterval> | null = null;
const FLUSH_INTERVAL_MS = 10000;
const MAX_BUFFER_SIZE = 50;

async function flushToDatadog() {
  if (!DD_API_KEY || _buffer.length === 0) return;
  const batch = _buffer.splice(0, MAX_BUFFER_SIZE);
  try {
    await fetch(DD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "DD-API-KEY": DD_API_KEY },
      body: JSON.stringify(batch.map(e => ({
        ddsource: "nodejs",
        service: DD_SERVICE,
        env: process.env.NODE_ENV || "production",
        level: e.level,
        message: e.message,
        context: e.context,
        data: e.data,
        error: e.error,
        timestamp: e.timestamp,
      }))),
    });
  } catch { /* silent */ }
}

function startFlushTimer() {
  if (_flushTimer) return;
  _flushTimer = setInterval(flushToDatadog, FLUSH_INTERVAL_MS);
}

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
    };

    if (data) {
      if (data instanceof Error) {
        entry.error = data.message;
      } else {
        entry.data = data;
      }
    }

    if (process.env.NODE_ENV === "production") {
      // Send to Datadog
      _buffer.push(entry);
      startFlushTimer();
      if (_buffer.length >= MAX_BUFFER_SIZE) flushToDatadog();
      // Also log locally
      console.log(JSON.stringify(entry));
    } else {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.context}]`;
      if (level === "error") {
        console.error(`${prefix} ${message}`, data || "");
      } else if (level === "warn") {
        console.warn(`${prefix} ${message}`, data || "");
      } else {
        console.log(`${prefix} ${message}`, data || "");
      }
    }
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, error?: any) {
    this.log("error", message, error);
  }

  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }
}

// Pre-configured loggers for different modules
export const loggers = {
  auth: new Logger("auth"),
  api: new Logger("api"),
  billing: new Logger("billing"),
  worker: new Logger("worker"),
  telegram: new Logger("telegram"),
  email: new Logger("email"),
  audit: new Logger("audit"),
  discovery: new Logger("discovery"),
};

export { Logger };
export default loggers;
