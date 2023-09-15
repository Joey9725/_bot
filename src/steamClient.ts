import SteamUser from 'steam-user';
import SteamTotp from 'steam-totp';
import SteamCommunity from '@tf2autobot/steamcommunity';

const SHARED_SECRET = process.env.SHARED_SECRET;
const STEAM_USERNAME = process.env.STEAM_USERNAME;
const STEAM_PASSWORD = process.env.STEAM_PASSWORD;

let currentRetry = 0;
const retryInterval = 10000; // 10 seconds

// Define the Offer type
export interface Offer {
    id: string;
    state: number;
    partner: { getSteamID64: () => string };
    requiresMobileConfirmation: boolean;
}
export interface CustomSteamUser extends SteamUser {
    acceptOffer(id: string): Promise<any>;
    declineOffer(id: string): Promise<any>;
}

export const client  = new SteamUser() as CustomSteamUser;
export const community = new SteamCommunity();

export function loginToSteam(): void {

    const tfacode = SteamTotp.generateAuthCode(SHARED_SECRET);

    const logOnOptions = {
        accountName: STEAM_USERNAME,
        password: STEAM_PASSWORD,
        twoFactorCode: tfacode
    };
    client.logOn(logOnOptions);
}
client.on('loggedOn', () => {
    console.log('Bot is online!');
    currentRetry = 0; // Reset retry count on successful login
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed([440, "beep...TRADING...boop"]);
});

client.on('webSession', (sessionid, cookies) => {
    community.setCookies(cookies);
});

client.on('error', (err) => {
    if (err.message === 'RateLimitExceeded') {
        const waitTime = Math.pow(2, currentRetry) * retryInterval;
        console.error(`Rate limited by Steam. Retrying in ${waitTime / 1000} seconds.`);
        setTimeout(loginToSteam, waitTime);
        currentRetry++;
    } else {
        console.error(`There was an error logging into Steam: ${err.message}`);
    }
});