require('dotenv').config();
const path = require('path');
const fs = require('fs');

let STEAM_ERROR_CODES;

try {
  STEAM_ERROR_CODES = JSON.parse(fs.readFileSync(path.join(__dirname, 'steamErrorCodes.json'), 'utf8'));
} catch (error) {
  console.error('Failed to read steamErrorCodes.json:', error);
  process.exit(1);
}

module.exports = {
  STEAM_ERROR_CODES,
  STEAM_ID: process.env.STEAM_ID,
  BOT_NAME: process.env.BOT_NAME,
  SHARED_SECRET: process.env.SHARED_SECRET,
  IDENTITY_SECRET: process.env.IDENTITY_SECRET,
  STEAM_USERNAME: process.env.STEAM_USERNAME,
  STEAM_PASSWORD: process.env.STEAM_PASSWORD,
  OWNER_ID: process.env.OWNER_ID,
  STEAM_API_KEY: process.env.STEAM_APIKEY,
  BPTF_API_KEY: process.env.BPTF_APIKEY,
  BPTF_USER_TOKEN: process.env.BPTF_USERTOKEN
};
