const { BOT_NAME } = require('./config');
const fs = require('fs');
const path = require('path');

const DEBUG = process.env.DEBUG;
const DEBUG_BOOL = DEBUG === 'true';
const LOG_FILE_PATH = path.join(__dirname, 'logs', 'log.txt');
const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5Mb
const API_LOG_FILE_PATH = path.join(__dirname, 'logs', 'api_log.txt');

const COLORS = {
    RESET: `\x1b[0m`,
    INFO: "\x1b[34m",
    ERROR: "\x1b[31m",
    TRADE: "\x1b[35m",
    DEBUG: "\x1b[36m"
};

class Logger {
    constructor(bot = "", offerId = "") {
        this.bot = bot;
        this.offerId = offerId;
        this.logStream = fs.createWriteStream(LOG_FILE_PATH, { flags: 'a' });
        this.apiLogStream = fs.createWriteStream(API_LOG_FILE_PATH, { flags: 'a' });
    }

    async init() {
        await ensureLogDirectoryExists();
        await rotateLogFile(LOG_FILE_PATH);
        await rotateLogFile(API_LOG_FILE_PATH);
        this.logStream = fs.createWriteStream(LOG_FILE_PATH, { flags: 'a' });
        this.apiLogStream = fs.createWriteStream(API_LOG_FILE_PATH, { flags: 'a' });
    }

    async logToFile(stream, strings) {
        return new Promise((resolve, reject) => {
            const toWrite = strings.join('\n');
            stream.write(toWrite + '\n', (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    generateTradeMessage(offerId, status) {
        return `Trade offer ${offerId} has ${status}`;
    }

    generateApiMessage(apiName, status, additionalInfo) {
        return {
            api: apiName,
            status: status,
            ...additionalInfo
        };
    }

    generateErrorMessage(error) {
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        } else {
            return `Unknown error: ${JSON.stringify(error)}`;
        }
    }

    generateDebugMessage(debugObject) {
        return `Debug Data: ${JSON.stringify(debugObject)}`;
    }

    async log(type, messageObj) {
        console.log("Debug: Type and MessageObj: ", type, messageObj);  // Debug statement
    
        let message = "";
        switch (type) {
            case 'trade':
                message = this.generateTradeMessage(messageObj.offerId, messageObj.status);
                break;
            case 'api':
                message = JSON.stringify(this.generateApiMessage(messageObj.apiName, messageObj.status, messageObj.additionalInfo));
                break;
            case 'error':
                message = this.generateErrorMessage(messageObj.error);
                break;
            case 'debug':
                message = this.generateDebugMessage(messageObj.debugObject);
                break;
            default:
                message = "No message provided";
        }
    
        console.log("Debug: Generated Message: ", message);  // Debug statement
    
        // Log the dynamically generated message
        await this.logToFile(this.logStream, [message]);
    }
}

async function ensureLogDirectoryExists() {
    try {
        if (!fs.existsSync(path.dirname(LOG_FILE_PATH))) {
            fs.mkdirSync(path.dirname(LOG_FILE_PATH), { recursive: true });
        }
    } catch (error) {
        console.error(`Failed to ensure log directory exists: ${error.message}`);
    }
}

async function rotateLogFile(filePath) {
    try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > MAX_LOG_FILE_SIZE) {
            const newLogFilePath = filePath.replace('.txt', `-${Date.now()}.txt`);
            fs.renameSync(filePath, newLogFilePath);
        }
    } catch (error) {
        console.error(`Failed to rotate log file: ${error.message}`);
    }
}

module.exports = Logger;
