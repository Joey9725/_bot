import * as fs from 'fs';
import * as path from 'path';

const LOGS_DIRECTORY = path.join(__dirname, 'logs');
const LOG_FILE_PATH = path.join(LOGS_DIRECTORY, 'log.txt');
const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_LOG_FILES = 10; // Number of log files to keep

export class Logger {
  // ANSI Escape Codes for text colors
  private readonly RED = '\x1b[31m';
  private readonly GREEN = '\x1b[32m';
  private readonly YELLOW = '\x1b[33m';
  private readonly BLUE = '\x1b[34m';
  private readonly RESET = '\x1b[0m';

  private logStream: fs.WriteStream;

  constructor(private loggerName: string) {
    this.initializeLogStream();
  }

  private initializeLogStream(): void {
    if (!fs.existsSync(LOGS_DIRECTORY)) {
      fs.mkdirSync(LOGS_DIRECTORY);
    }
  
    this.rotateLogFiles();
  
    const logFilePath = path.join(LOGS_DIRECTORY, `${this.loggerName}.log`);
  
    if (!fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, ''); // Create an empty log file if it doesn't exist
    }
  
    this.logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  }

  private rotateLogFiles(): void {
    const existingLogs = fs.readdirSync(LOGS_DIRECTORY);
    const logFiles = existingLogs.filter((file) => file.startsWith('log'));

    if (logFiles.length >= MAX_LOG_FILES) {
      // Remove excess log files
      const filesToRemove = logFiles.slice(0, logFiles.length - MAX_LOG_FILES + 1);
      for (const fileToRemove of filesToRemove) {
        fs.unlinkSync(path.join(LOGS_DIRECTORY, fileToRemove));
      }
    }
  }

  public log(level: string, message: string): void {
    const timestamp = `[${new Date().toISOString()}]`;
    let colorizedLevel: string;

    switch (level) {
      case 'INFO':
        colorizedLevel = `${this.GREEN}INFO${this.RESET}`;
        break;
      case 'WARN':
        colorizedLevel = `${this.YELLOW}WARN${this.RESET}`;
        break;
      case 'ERROR':
        colorizedLevel = `${this.RED}ERROR${this.RESET}`;
        break;
      case 'DEBUG':
        colorizedLevel = `${this.BLUE}DEBUG${this.RESET}`;
        break;
      default:
        colorizedLevel = level;
    }

    const logMessage = `${timestamp} [${colorizedLevel}] ${message}\n`;
    this.logStream.write(logMessage);
    console.log(logMessage);  // Output to console with color

    const currentLogFileSize = this.getLogFileSize();
    if (currentLogFileSize >= MAX_LOG_FILE_SIZE) {
      this.rotateLogFile();
    }
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
  
  private getLogFileSize(): number {
    const logFilePath = path.join(LOGS_DIRECTORY, `${this.loggerName}.log`);
    if (fs.existsSync(logFilePath)) {
      const stats = fs.statSync(logFilePath);
      return stats.size;
    }
    return 0; // Return 0 if the file doesn't exist
  }

  private rotateLogFile(): void {
    this.logStream.end();
    const logFilePath = path.join(LOGS_DIRECTORY, 'log.txt');
    const rotatedLogFilePath = path.join(LOGS_DIRECTORY, `log_${Date.now()}.txt`);
    fs.renameSync(logFilePath, rotatedLogFilePath);
    this.initializeLogStream();
  }
}
