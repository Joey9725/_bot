"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LOGS_DIRECTORY = path.join(__dirname, 'logs');
const LOG_FILE_PATH = path.join(LOGS_DIRECTORY, 'log.txt');
const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_LOG_FILES = 10; // Number of log files to keep
class Logger {
    constructor(loggerName) {
        this.loggerName = loggerName;
        // ANSI Escape Codes for text colors
        this.RED = '\x1b[31m';
        this.GREEN = '\x1b[32m';
        this.YELLOW = '\x1b[33m';
        this.BLUE = '\x1b[34m';
        this.RESET = '\x1b[0m';
        this.initializeLogStream();
    }
    initializeLogStream() {
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
    rotateLogFiles() {
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
    log(level, message) {
        const timestamp = `[${new Date().toISOString()}]`;
        let colorizedLevel;
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
        console.log(logMessage); // Output to console with color
        const currentLogFileSize = this.getLogFileSize();
        if (currentLogFileSize >= MAX_LOG_FILE_SIZE) {
            this.rotateLogFile();
        }
    }
    info(message) {
        this.log('INFO', message);
    }
    warn(message) {
        this.log('WARN', message);
    }
    error(message) {
        this.log('ERROR', message);
    }
    debug(message) {
        this.log('DEBUG', message);
    }
    getLogFileSize() {
        const logFilePath = path.join(LOGS_DIRECTORY, `${this.loggerName}.log`);
        if (fs.existsSync(logFilePath)) {
            const stats = fs.statSync(logFilePath);
            return stats.size;
        }
        return 0; // Return 0 if the file doesn't exist
    }
    rotateLogFile() {
        this.logStream.end();
        const logFilePath = path.join(LOGS_DIRECTORY, 'log.txt');
        const rotatedLogFilePath = path.join(LOGS_DIRECTORY, `log_${Date.now()}.txt`);
        fs.renameSync(logFilePath, rotatedLogFilePath);
        this.initializeLogStream();
    }
}
exports.Logger = Logger;
