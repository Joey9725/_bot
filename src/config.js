"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BPTF_USER_TOKEN = exports.BPTF_API_KEY = exports.BOT_NAME = exports.STEAM_ID = exports.STEAM_API_KEY = exports.OWNER_ID = exports.STEAM_PASSWORD = exports.STEAM_USERNAME = exports.IDENTITY_SECRET = exports.SHARED_SECRET = void 0;
// Importing dotenv to load environment variables from a .env file
var dotenv = require("dotenv");
dotenv.config();
// Exporting environment variables as constants
exports.SHARED_SECRET = process.env.SHARED_SECRET;
exports.IDENTITY_SECRET = process.env.IDENTITY_SECRET;
exports.STEAM_USERNAME = process.env.STEAM_USERNAME;
exports.STEAM_PASSWORD = process.env.STEAM_PASSWORD;
exports.OWNER_ID = process.env.OWNER_ID;
exports.STEAM_API_KEY = process.env.STEAM_APIKEY;
exports.STEAM_ID = process.env.STEAM_ID;
exports.BOT_NAME = process.env.BOT_NAME;
exports.BPTF_API_KEY = process.env.BPTF_APIKEY;
exports.BPTF_USER_TOKEN = process.env.BPTF_USERTOKEN;
