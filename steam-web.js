const axios = require('axios');
const Logger = require('./logger');
const { STEAM_API_KEY, STEAM_ID } = require('./config');

async function main() {
  const logger = new Logger("SteamAPI");
  await logger.init(); // Await the initialization
  
  getOwnUserID(logger).then(ownUserID => {
    if (ownUserID) {
      logger.info(JSON.stringify({ message: 'Your Steam User ID:', userId: ownUserID }));
    }
  });
}


const steamAPI = axios.create({
  baseURL: 'https://api.steampowered.com',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

function buildUrl(interfaceName, methodName, version, params) {
  let url = `/${interfaceName}/${methodName}/v${version}/?key=${STEAM_API_KEY}`;
  for (const [key, value] of Object.entries(params)) {
    url += `&${key}=${value}`;
  }
  return url;
}

async function getOwnUserID(logger) {
  try {
    const url = `/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&format=json&steamids=${STEAM_ID}`;
    const response = await steamAPI.get(url);
    const data = response.data;
    logger.info(`API Response: ${JSON.stringify(data)}`);
    
    if (data.response && data.response.players && data.response.players.length > 0) {
      const ownUserID = data.response.players[0].steamid;
      return ownUserID;
    } else {
      logger.info(`Unable to retrieve Steam user ID: ${JSON.stringify(data)}`);
      return null;
    }
  } catch (error) {
    logger.error(`Error fetching Steam user data: ${error.message}`);
    return null;
  }
}

// Example function to retrieve trade offers
async function getTradeOffers(userId) {
  const tradeOffers = await steamAPI.ITradeOffers_440.GetTradeOffers(apiKey, userId);
  return tradeOffers;
}

// Example function to send a trade offer
async function sendTradeOffer(senderId, recipientId, items) {
  const response = await steamAPI.ITradeOffers_440.SendTradeOffer(apiKey, senderId, recipientId, items);
  return response;
}

// Example function to accept a trade offer
async function acceptTradeOffer(offerId) {
  const response = await steamAPI.ITradeOffers_440.AcceptTradeOffer(apiKey, offerId);
  return response;
}

// Example function to decline a trade offer
async function declineTradeOffer(offerId) {
  const response = await steamAPI.ITradeOffers_440.DeclineTradeOffer(apiKey, offerId);
  return response;
}

async function getPlayerSummaries(steamIds) {
  try {
    const url = buildUrl('ISteamUser', 'GetPlayerSummaries', 2, { steamids: steamIds.join(',') });
    const response = await steamAPI.get(url);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching player summaries: ${error.message}`);
    return null;
  }
}

async function getFriendList(steamId) {
  try {
    const url = buildUrl('ISteamUser', 'GetFriendList', 1, { steamid: steamId, relationship: 'friend' });
    const response = await steamAPI.get(url);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching friend list: ${error.message}`);
    return null;
  }
}

async function getTF2ItemSchema() {
  try {
    const url = buildUrl('IEconItems_440', 'GetSchemaItems', 1, {});
    const response = await steamAPI.get(url);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching item schema: ${error.message}`);
    return null;
  }
}

getOwnUserID().then(ownUserID => {
  if (ownUserID) {
    logger.info(JSON.stringify({ message: 'Your Steam User ID:', userId: ownUserID }));
  }
});

main().catch(err => {
  console.error("An error occurred:", err);
});
