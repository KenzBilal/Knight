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

    // In production, send to external logging service
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to Sentry, Datadog, etc.
      console.log(JSON.stringify(entry));
    } else {
      // Dev: readable format
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

  // Create child logger with additional context
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
