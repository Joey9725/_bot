import { client, community, loginToSteam, Offer } from './steamClient';

let currentRetry = 0;
const retryInterval = 10000; // 10 seconds

client.on('loggedOn', () => {
    console.log('Bot is online!');
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
        console.error(`Rate limited by Steam. Retrying in ${waitTime / 1000} seconds.`);
        setTimeout(loginToSteam, waitTime);
        currentRetry++;
    } else {
        console.error(`There was an error logging into Steam: ${err.message}`);
    }
});

loginToSteam();  // Corrected this line
