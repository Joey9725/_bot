const { STEAM_ERROR_CODES } = require('./config');
const logger = require('./logger'); // Import the logger if it's defined in another module

function handleSteamError(errorCode) {
    const errorMessage = STEAM_ERROR_CODES[errorCode];
    if (errorMessage) {
        logger.error(`Steam Error: ${errorMessage}`);
    } else {
        logger.error(`Unknown Steam Error with code: ${errorCode}`);
    }
}

module.exports = {
    handleSteamError
};
