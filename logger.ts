import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE_PATH = path.join(__dirname, 'logs', 'log.txt');
const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024;

export class Logger {
  private logStream: fs.WriteStream;

  constructor() {
    this.logStream = fs.createWriteStream(LOG_FILE_PATH, { flags: 'a' });
  }

  public info(message: string): void {
    this.log('INFO', message);
  }

  public warn(message: string): void {
    this.log('WARN', message);
  }

  public error(message: string): void {
    this.log('ERROR', message);
  }

  public debug(message: string): void {
    this.log('DEBUG', message);
  }

  private log(level: string, message: string): void {
    const logMessage = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    this.logStream.write(logMessage);
  }
}
