"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var fs = require("fs");
var path = require("path");
var LOGS_DIRECTORY = path.join(__dirname, 'logs');
var LOG_FILE_PATH = path.join(LOGS_DIRECTORY, 'log.txt');
var MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
var MAX_LOG_FILES = 10; // Number of log files to keep
var Logger = /** @class */ (function () {
    function Logger(loggerName) {
        this.loggerName = loggerName;
        this.initializeLogStream();
    }
    Logger.prototype.initializeLogStream = function () {
        if (!fs.existsSync(LOGS_DIRECTORY)) {
            fs.mkdirSync(LOGS_DIRECTORY);
        }
        this.rotateLogFiles();
        var logFilePath = path.join(LOGS_DIRECTORY, "".concat(this.loggerName, ".log"));
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, ''); // Create an empty log file if it doesn't exist
        }
        this.logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
    };
    Logger.prototype.rotateLogFiles = function () {
        var existingLogs = fs.readdirSync(LOGS_DIRECTORY);
        var logFiles = existingLogs.filter(function (file) { return file.startsWith('log'); });
        if (logFiles.length >= MAX_LOG_FILES) {
            // Remove excess log files
            var filesToRemove = logFiles.slice(0, logFiles.length - MAX_LOG_FILES + 1);
            for (var _i = 0, filesToRemove_1 = filesToRemove; _i < filesToRemove_1.length; _i++) {
                var fileToRemove = filesToRemove_1[_i];
                fs.unlinkSync(path.join(LOGS_DIRECTORY, fileToRemove));
            }
        }
    };
    Logger.prototype.log = function (level, message) {
        var logMessage = "[".concat(new Date().toISOString(), "] [").concat(level, "] ").concat(message, "\n");
        this.logStream.write(logMessage);
        var currentLogFileSize = this.getLogFileSize();
        if (currentLogFileSize >= MAX_LOG_FILE_SIZE) {
            this.rotateLogFile();
        }
    };
    Logger.prototype.info = function (message) {
        this.log('INFO', message);
    };
    Logger.prototype.warn = function (message) {
        this.log('WARN', message);
    };
    Logger.prototype.error = function (message) {
        this.log('ERROR', message);
    };
    Logger.prototype.debug = function (message) {
        this.log('DEBUG', message);
    };
    Logger.prototype.getLogFileSize = function () {
        var logFilePath = path.join(LOGS_DIRECTORY, "".concat(this.loggerName, ".log"));
        if (fs.existsSync(logFilePath)) {
            var stats = fs.statSync(logFilePath);
            return stats.size;
        }
        return 0; // Return 0 if the file doesn't exist
    };
    Logger.prototype.rotateLogFile = function () {
        this.logStream.end();
        var logFilePath = path.join(LOGS_DIRECTORY, 'log.txt');
        var rotatedLogFilePath = path.join(LOGS_DIRECTORY, "log_".concat(Date.now(), ".txt"));
        fs.renameSync(logFilePath, rotatedLogFilePath);
        this.initializeLogStream();
    };
    return Logger;
}());
exports.Logger = Logger;
