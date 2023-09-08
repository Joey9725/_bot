import { getPriceHistory } from '../bptf-web';
import { Logger } from '../logger';
import { BOT_NAME } from '../config';
import { client, community, loginToSteam, Offer } from './steamClient';

const logger: Logger = new Logger(BOT_NAME);

let currentRetry = 0;
const retryInterval = 10000; // 10 seconds

client.on('loggedOn', () => {
    logger.info('Bot is online!');
    currentRetry = 0; // Reset retry count on successful login
    client.setPersona(client.EPersonaState.Online);
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
    } else {
        logger.error(`There was an error logging into Steam: ${err.message}`);
    }
});

loginToSteam();  // Corrected this line
