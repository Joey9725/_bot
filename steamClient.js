"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var steam_user_1 = require("steam-user");
var steam_totp_1 = require("steam-totp");
var steamcommunity_1 = require("@tf2autobot/steamcommunity");
var config_1 = require("./config");
var client = new steam_user_1.default();
var community = new steamcommunity_1.default();
function loginToSteam() {
    var tfacode = steam_totp_1.default.generateAuthCode(config_1.SHARED_SECRET);
    var logOnOptions = {
        accountName: config_1.STEAM_USERNAME,
        password: config_1.STEAM_PASSWORD,
        twoFactorCode: tfacode
    };
    client.logOn(logOnOptions);
}
module.exports = {
    client: client,
    community: community,
    loginToSteam: loginToSteam
};
