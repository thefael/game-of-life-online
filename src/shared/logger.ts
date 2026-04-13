// Shared logging system for client-server communication debugging

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  source: 'CLIENT' | 'SERVER';
  step: string;
  message: string;
  data?: any;
}

export class Logger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 100;

  static log(
    level: LogLevel,
    source: 'CLIENT' | 'SERVER',
    step: string,
    message: string,
    data?: any
  ) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      source,
      step,
      message,
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const color =
      level === LogLevel.ERROR
        ? 'color: #ff6b6b; font-weight: bold;'
        : level === LogLevel.SUCCESS
          ? 'color: #51cf66; font-weight: bold;'
          : level === LogLevel.WARN
            ? 'color: #ffd43b; font-weight: bold;'
            : level === LogLevel.DEBUG
              ? 'color: #888888;'
              : 'color: #4dabf7;';

    console.log(
      `%c[${source}/${step}] ${message}`,
      color,
      data ? data : ''
    );
  }

  static getLogs(): LogEntry[] {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
  }
}
