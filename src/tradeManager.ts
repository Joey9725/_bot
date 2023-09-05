import { client, community, loginToSteam, Offer } from './steamClient';
import { Logger } from './logger';
const { BOT_NAME, OWNER_ID, IDENTITY_SECRET } = require('./config');

const logger: Logger = new Logger(BOT_NAME);

enum ETradeOfferState {
    Active = 2,
    // Add other states as needed
}

client.on('webSession', (sessionid: string, cookies: string[]) => {
    community.setCookies(cookies);
});

client.on('tradeOffers', async (offers: Offer[]) => {
    logger.info(`Received ${offers.length} trade offers.`);
    for (const offer of offers) {
        await handleOffer(offer);
    }
});

async function handleOffer(offer: Offer): Promise<void> {
    logger.info(`Received trade offer with ID: ${offer.id}, state: ${offer.state}`);

    try {
        if (offer.state === ETradeOfferState.Active) {
            if (offer.partner.getSteamID64() === OWNER_ID) {
                const status = await client.acceptOffer(offer.id);
                logger.info(`Accepted offer ${offer.id}. Status: ${status}.`);
            } else {
                await client.declineOffer(offer.id);
                logger.info(`Declined offer ${offer.id}.`);
            }
        } else {
            logger.info(`Offer ${offer.id} is not active. Current state: ${offer.state}`);
        }
    } catch (error) {
        logger.error(`Error handling offer ${offer.id}: ${error}`);
    }

    if (offer.requiresMobileConfirmation) {
        await confirmMobile(offer);
    }
}

async function confirmMobile(offer: Offer): Promise<void> {
    try {
        await community.acceptConfirmationForObject(IDENTITY_SECRET, offer.id);
        logger.info(`Confirmed mobile confirmation for trade ${offer.id}`);
    } catch (error) {
        logger.error(`Error confirming mobile confirmation for trade ${offer.id}: ${error.message}`);
    }
}

export {
    handleOffer
};