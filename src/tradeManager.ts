const { client } = require('./steamClient');
const Logger = require('./logger');
const SteamCommunity = require('steamcommunity');
const { BOT_NAME, OWNER_ID, IDENTITY_SECRET } = require('./config');


const logger = new Logger(BOT_NAME);
const community = new SteamCommunity();

client.on('webSession', (sessionid, cookies) => {
    community.setCookies(cookies);
});

client.on('tradeOffers', async (offers) => {
    logger.info(`Received ${offers.length} trade offers.`);
    for (const offer of offers) {
        await handleOffer(offer);
    }
});

async function handleOffer(offer) {
    logger.info(`Received trade offer with ID: ${offer.id}, state: ${offer.state}`);

    // Using the client instance for trade offer handling
    try {
        // Ensure that the offer is still active
        if (offer.state === 2 /* ETradeOfferState.Active */) {
            console.log('Offer is active');
            if (offer.partner.getSteamID64() === OWNER_ID) {
                console.log('Offer is from the owner');
                // Accept offers from the owner
                const status = await client.acceptOffer(offer.id);
                logger.info(`Accepted offer ${offer.id}. Status: ${status}.`);
            } else {
                console.log('Offer is not from the owner');
                // Decline offers from others
                await client.declineOffer(offer.id);
                logger.info(`Declined offer ${offer.id}.`);
            }
        } else {
            console.log('Offer is not active');
            // Log that the offer is not active
            logger.info(`Offer ${offer.id} is not active. Current state: ${offer.state}`);
        }
    } catch (error) {
        console.error('Error handling offer:', error);
        logger.error(`Error handling offer ${offer.id}: ${error}`);
    }

    if (offer.requiresMobileConfirmation) {
        console.log('Offer requires mobile confirmation');
        const community = new SteamCommunity();
        const identitySecret = IDENTITY_SECRET; // Your Steam Identity Secret

        // Confirm the mobile confirmation for the trade
        try {
            await community.acceptConfirmationForObject(identitySecret, offer.id);
            logger.info(`Confirmed mobile confirmation for trade ${offer.id}`);
        } catch (error) {
            console.error('Error confirming mobile confirmation:', error);
            logger.error(`Error confirming mobile confirmation for trade ${offer.id}: ${error.message}`);
        }
    }
}

module.exports = {
    handleOffer
};