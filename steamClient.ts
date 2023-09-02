import SteamUser from 'steam-user';
import SteamTotp from 'steam-totp';
import SteamCommunity from '@tf2autobot/steamcommunity';
import { SHARED_SECRET, STEAM_USERNAME, STEAM_PASSWORD } from './config';

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
