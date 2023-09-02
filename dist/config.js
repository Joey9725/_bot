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
exports.BPTF_USER_TOKEN = exports.BPTF_API_KEY = exports.BOT_NAME = exports.STEAM_ID = exports.STEAM_API_KEY = exports.OWNER_ID = exports.STEAM_PASSWORD = exports.STEAM_USERNAME = exports.IDENTITY_SECRET = exports.SHARED_SECRET = void 0;
// Importing dotenv to load environment variables from a .env file
const dotenv = __importStar(require("dotenv"));
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
