enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

class Logger {
  static logLevel: LogLevel = LogLevel.INFO; // default log level

  static setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  static debug(message: string) {
    if (this.logLevel === LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`);
    }
  }

  static info(message: string) {
    if (this.logLevel === LogLevel.DEBUG || this.logLevel === LogLevel.INFO) {
      console.info(`[INFO] ${message}`);
    }
  }

  static warn(message: string) {
    if (
      this.logLevel === LogLevel.DEBUG ||
      this.logLevel === LogLevel.INFO ||
      this.logLevel === LogLevel.WARN
    ) {
      console.warn(`[WARN] ${message}`);
    }
  }

  static error(message: string) {
    console.error(`[ERROR] ${message}`);
  }
}

export { Logger, LogLevel };