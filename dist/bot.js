var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { client, loginToSteam, community } = require('./steamClient');
const SteamUser = require('steam-user');
const { getPriceHistory } = require('./backpacktf');
const Logger = require('./logger');
const { STEAM_ERROR_CODES, BOT_NAME } = require('./config');
const { handleSteamError } = require('./utils');
const logger = new Logger(BOT_NAME);
let currentRetry = 0;
const retryInterval = 10000; // 10 seconds
client.on('loggedOn', () => {
    logger.info('Bot is online!');
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
        logger.error(`Rate limited by Steam. Retrying in ${waitTime / 1000} seconds.`);
        setTimeout(loginToSteam, waitTime);
        currentRetry++;
    }
    else {
        logger.error(`There was an error logging into Steam: ${err.message}`);
    }
});
loginToSteam();
// PRICES TEST
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prices = yield getPriceHistory({
                item: 'Team Captain',
                quality: 'Unusual',
                tradable: 'Tradable',
                craftable: 'Craftable',
                priceindex: '34' // Replace with the actual price index
            });
            console.log(prices);
        }
        catch (error) {
            logger.error('Error fetching prices');
            logger.error(`Error Details: ${JSON.stringify(error, null, 2)}`);
            if (error.response) {
                logger.info('Error Response:', JSON.stringify(error.response.data, null, 2));
            }
        }
    });
}
test();
// ERROR HANDLING
client.on('error', (err) => {
    logger.error(`There was an error logging into Steam: ${err.message}`);
});
client.on('friendMessage', (steamID, message) => {
    // Handle incoming messages from friends
    // You can add your message handling logic here
    console.log(`Received message from ${steamID.getSteamID64()}: ${message}`);
});
client.on('tradeOffers', (offers) => __awaiter(this, void 0, void 0, function* () {
    console.log('Received trade offers:', offers);
    const offerArray = Object.values(offers);
    for (const offer of offerArray) {
        yield handleOffer(offer);
    }
}));
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err.message}`);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    const errorMessage = `Unhandled promise rejection: Reason: ${reason.stack || reason}`;
    logger.error(errorMessage);
});
