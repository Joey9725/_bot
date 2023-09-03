import axios from 'axios';
import { Logger } from './logger'; // Adjust the path as needed
import { STEAM_API_KEY, STEAM_ID } from './config'; // Importing from your config file

const logger = new Logger("SteamAPI");

async function getOwnUserID() {
    try {
        const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`;
        const response = await axios.get(url);
        const data = response.data;

        if (data.response && data.response.players && data.response.players.length > 0) {
            const ownUserID = data.response.players[0].steamid;
            logger.info(`Your Steam User ID: ${ownUserID}`);
            return ownUserID;
        } else {
            logger.warn("Unable to retrieve Steam user ID");
            return null;
        }
    } catch (error) {
        logger.error(`Error fetching Steam user data: ${error.message}`);
        return null;
    }
}

async function main() {
    const userId = await getOwnUserID();
    if (userId) {
        // Do something with the user ID
    }
}

main().catch(err => {
    logger.error(`An error occurred: ${err}`);
});
