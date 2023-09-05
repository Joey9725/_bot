"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOffer = void 0;
const steamClient_1 = require("./steamClient");
const logger_1 = require("./logger");
const { BOT_NAME, OWNER_ID, IDENTITY_SECRET } = require('./config');
const logger = new logger_1.Logger(BOT_NAME);
var ETradeOfferState;
(function (ETradeOfferState) {
    ETradeOfferState[ETradeOfferState["Active"] = 2] = "Active";
    // Add other states as needed
})(ETradeOfferState || (ETradeOfferState = {}));
steamClient_1.client.on('webSession', (sessionid, cookies) => {
    steamClient_1.community.setCookies(cookies);
});
steamClient_1.client.on('tradeOffers', (offers) => __awaiter(void 0, void 0, void 0, function* () {
    logger.info(`Received ${offers.length} trade offers.`);
    for (const offer of offers) {
        yield handleOffer(offer);
    }
}));
function handleOffer(offer) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Received trade offer with ID: ${offer.id}, state: ${offer.state}`);
        try {
            if (offer.state === ETradeOfferState.Active) {
                if (offer.partner.getSteamID64() === OWNER_ID) {
                    const status = yield steamClient_1.client.acceptOffer(offer.id);
                    logger.info(`Accepted offer ${offer.id}. Status: ${status}.`);
                }
                else {
                    yield steamClient_1.client.declineOffer(offer.id);
                    logger.info(`Declined offer ${offer.id}.`);
                }
            }
            else {
                logger.info(`Offer ${offer.id} is not active. Current state: ${offer.state}`);
            }
        }
        catch (error) {
            logger.error(`Error handling offer ${offer.id}: ${error}`);
        }
        if (offer.requiresMobileConfirmation) {
            yield confirmMobile(offer);
        }
    });
}
exports.handleOffer = handleOffer;
function confirmMobile(offer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield steamClient_1.community.acceptConfirmationForObject(IDENTITY_SECRET, offer.id);
            logger.info(`Confirmed mobile confirmation for trade ${offer.id}`);
        }
        catch (error) {
            logger.error(`Error confirming mobile confirmation for trade ${offer.id}: ${error.message}`);
        }
    });
}
