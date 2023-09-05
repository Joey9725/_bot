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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginToSteam = exports.community = exports.client = void 0;
const SteamUser = __importStar(require("steam-user"));
const steam_totp_1 = __importDefault(require("steam-totp"));
const steamcommunity_1 = __importDefault(require("@tf2autobot/steamcommunity"));
const config_1 = require("./config");
exports.client = new SteamUser();
exports.community = new steamcommunity_1.default();
function loginToSteam() {
    const tfacode = steam_totp_1.default.generateAuthCode(config_1.SHARED_SECRET);
    const logOnOptions = {
        accountName: config_1.STEAM_USERNAME,
        password: config_1.STEAM_PASSWORD,
        twoFactorCode: tfacode
    };
    exports.client.logOn(logOnOptions);
}
exports.loginToSteam = loginToSteam;
module.exports = {
    client: exports.client,
    community: exports.community,
    loginToSteam
};
