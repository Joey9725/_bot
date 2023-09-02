var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { client } = require('./steamClient');
const Logger = require('./logger');
const SteamCommunity = require('steamcommunity'); // Assuming the package name is 'steamcommunity'
const { BOT_NAME, OWNER_ID, IDENTITY_SECRET } = require('./config');
const logger = new Logger(BOT_NAME);
const community = new SteamCommunity();
client.on('webSession', (sessionid, cookies) => {
    community.setCookies(cookies);
});
client.on('tradeOffers', (offers) => __awaiter(this, void 0, void 0, function* () {
    logger.info(`Received ${offers.length} trade offers.`);
    for (const offer of offers) {
        yield handleOffer(offer);
    }
}));
function handleOffer(offer) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Received trade offer with ID: ${offer.id}, state: ${offer.state}`);
        // Using the client instance for trade offer handling
        try {
            // Ensure that the offer is still active
            if (offer.state === 2 /* ETradeOfferState.Active */) {
                console.log('Offer is active');
                if (offer.partner.getSteamID64() === OWNER_ID) {
                    console.log('Offer is from the owner');
                    // Accept offers from the owner
                    const status = yield client.acceptOffer(offer.id);
                    logger.info(`Accepted offer ${offer.id}. Status: ${status}.`);
                }
                else {
                    console.log('Offer is not from the owner');
                    // Decline offers from others
                    yield client.declineOffer(offer.id);
                    logger.info(`Declined offer ${offer.id}.`);
                }
            }
            else {
                console.log('Offer is not active');
                // Log that the offer is not active
                logger.info(`Offer ${offer.id} is not active. Current state: ${offer.state}`);
            }
        }
        catch (error) {
            console.error('Error handling offer:', error);
            logger.error(`Error handling offer ${offer.id}: ${error}`);
        }
        if (offer.requiresMobileConfirmation) {
            console.log('Offer requires mobile confirmation');
            const community = new SteamCommunity();
            const identitySecret = IDENTITY_SECRET; // Your Steam Identity Secret
            // Confirm the mobile confirmation for the trade
            try {
                yield community.acceptConfirmationForObject(identitySecret, offer.id);
                logger.info(`Confirmed mobile confirmation for trade ${offer.id}`);
            }
            catch (error) {
                console.error('Error confirming mobile confirmation:', error);
                logger.error(`Error confirming mobile confirmation for trade ${offer.id}: ${error.message}`);
            }
        }
    });
}
module.exports = {
    handleOffer
};
