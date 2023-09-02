const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('@tf2autobot/steamcommunity');
const { SHARED_SECRET, STEAM_USERNAME, STEAM_PASSWORD } = require('./config');

const client = new SteamUser();
const community = new SteamCommunity();

function loginToSteam() {
    const tfacode = SteamTotp.generateAuthCode(SHARED_SECRET);
    const logOnOptions = {
        accountName: STEAM_USERNAME,
        password: STEAM_PASSWORD,
        twoFactorCode: tfacode
    };
    client.logOn(logOnOptions);
}

module.exports = {
    client,
    community,
    loginToSteam
};
