"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const steam_user_1 = __importDefault(require("steam-user"));
const steam_totp_1 = __importDefault(require("steam-totp"));
const steamcommunity_1 = __importDefault(require("@tf2autobot/steamcommunity"));
const config_1 = require("./config");
const client = new steam_user_1.default();
const community = new steamcommunity_1.default();
function loginToSteam() {
    const tfacode = steam_totp_1.default.generateAuthCode(config_1.SHARED_SECRET);
    const logOnOptions = {
        accountName: config_1.STEAM_USERNAME,
        password: config_1.STEAM_PASSWORD,
        twoFactorCode: tfacode
    };
    client.logOn(logOnOptions);
}
module.exports = {
    client,
    community,
    loginToSteam
};
