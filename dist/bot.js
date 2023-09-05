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
const bptf_web_1 = require("../bptf-web");
const logger_1 = require("../logger");
const config_1 = require("../config");
const steamClient_1 = require("./steamClient");
const logger = new logger_1.Logger(config_1.BOT_NAME);
let currentRetry = 0;
const retryInterval = 10000; // 10 seconds
steamClient_1.client.on('loggedOn', () => {
    logger.info('Bot is online!');
    currentRetry = 0; // Reset retry count on successful login
    steamClient_1.client.setPersona(steamClient_1.client.EPersonaState.Online);
    steamClient_1.client.gamesPlayed([440, "beep...TRADING...boop"]);
});
steamClient_1.client.on('webSession', (sessionid, cookies) => {
    steamClient_1.community.setCookies(cookies);
});
steamClient_1.client.on('error', (err) => {
    if (err.message === 'RateLimitExceeded') {
        const waitTime = Math.pow(2, currentRetry) * retryInterval;
        logger.error(`Rate limited by Steam. Retrying in ${waitTime / 1000} seconds.`);
        setTimeout(steamClient_1.loginToSteam, waitTime);
        currentRetry++;
    }
    else {
        logger.error(`There was an error logging into Steam: ${err.message}`);
    }
});
(0, steamClient_1.loginToSteam)(); // Corrected this line
// PRICES TEST
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prices = yield (0, bptf_web_1.getPriceHistory)({
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
                const errorMessage = `Unhandled promise rejection: Reason: ${error.stack || error}`; // Corrected this line
            }
        }
    });
}
test();
