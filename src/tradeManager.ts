import { client as baseClient, community, Offer } from './steamClient';
import SteamUser from "steam-user";

const { OWNER_ID, IDENTITY_SECRET } = require('./config');
const client = baseClient as MyCustomSteamUser;
interface MyCustomSteamUser extends SteamUser {
    acceptOffer(id: string): Promise<any>;
    declineOffer(id: string): Promise<any>;
}


enum ETradeOfferState {
    Invalid = 1,
    Active = 2,
    Accepted = 3,
    Countered = 4,
    Expired = 5,
    Canceled = 6,
    Declined = 7,
    InvalidItems = 8,
    CreatedNeedsConfirmation = 9,
    CanceledBySecondFactor = 10
}

client.on('webSession', (sessionid: string, cookies: string[]) => {
    community.setCookies(cookies);
});

async function handleOffer(offer: Offer): Promise<void> {
    console.log(`Received trade offer with ID: ${offer.id}, state: ${offer.state}`);

    try {
        if (offer.state === ETradeOfferState.Active) {
            if (offer.partner.getSteamID64() === OWNER_ID) {
                const status = await client.acceptOffer(offer.id);
                console.log(`Accepted offer ${offer.id}. Status: ${status}.`);
            } else {
                await client.declineOffer(offer.id);
                console.log(`Declined offer ${offer.id}.`);
            }
        } else {
            console.log(`Offer ${offer.id} is not active. Current state: ${offer.state}`);
        }
    } catch (error) {
        console.error(`Error handling offer ${offer.id}: ${error}`);
    }

    if (offer.requiresMobileConfirmation) {
        await confirmMobile(offer);
    }
}

async function confirmMobile(offer: Offer): Promise<void> {
    try {
        await community.acceptConfirmationForObject(IDENTITY_SECRET, offer.id);
        console.log(`Confirmed mobile confirmation for trade ${offer.id}`);
    } catch (error) {
        console.error(`Error confirming mobile confirmation for trade ${offer.id}: ${error.message}`);
    }
}

export {
    handleOffer
};