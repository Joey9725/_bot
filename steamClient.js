"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginToSteam = exports.community = exports.client = void 0;
var steam_user_1 = require("steam-user");
var steam_totp_1 = require("steam-totp");
var steamcommunity_1 = require("@tf2autobot/steamcommunity");
var config_1 = require("./config");
exports.client = new steam_user_1.default();
exports.community = new steamcommunity_1.default();
function loginToSteam() {
    var tfacode = steam_totp_1.default.generateAuthCode(config_1.SHARED_SECRET);
    var logOnOptions = {
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
    loginToSteam: loginToSteam
};
