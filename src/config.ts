// Importing dotenv to load environment variables from a .env file
import dotenv from 'dotenv';
dotenv.config();

// Exporting environment variables as constants
export const SHARED_SECRET = process.env.SHARED_SECRET as string;
export const IDENTITY_SECRET = process.env.IDENTITY_SECRET as string;
export const STEAM_USERNAME = process.env.STEAM_USERNAME as string;
export const STEAM_PASSWORD = process.env.STEAM_PASSWORD as string;
export const OWNER_ID = process.env.OWNER_ID as string;
export const STEAM_API_KEY = process.env.STEAM_APIKEY as string;
export const STEAM_ID = process.env.STEAM_ID as string;
export const BOT_NAME = process.env.BOT_NAME as string;
export const BPTF_API_KEY = process.env.BPTF_API_KEY as string;
export const BPTF_USER_TOKEN = process.env.BPTF_USER_TOKEN as string;
