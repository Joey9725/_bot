import * as SteamUser from 'steam-user';
import SteamTotp from 'steam-totp';
import SteamCommunity from '@tf2autobot/steamcommunity';
import { SHARED_SECRET, STEAM_USERNAME, STEAM_PASSWORD } from './config';

// Define the Offer type
export interface Offer {
    id: string;
    state: number;
    partner: { getSteamID64: () => string };
    requiresMobileConfirmation: boolean;
    // Add other fields as needed
}

export const client = new SteamUser();
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

module.exports = {
    client,
    community,
    loginToSteam
};
