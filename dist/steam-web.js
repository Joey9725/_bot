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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// steam-web.ts
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger"); // Adjust the path as needed
const config_1 = require("./config"); // Importing from your config file
const logger = new logger_1.Logger("SteamAPI");
function getOwnUserID() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${config_1.STEAM_API_KEY}&steamids=${config_1.STEAM_ID}`;
            const response = yield axios_1.default.get(url);
            const data = response.data;
            if (data.response && data.response.players && data.response.players.length > 0) {
                const ownUserID = data.response.players[0].steamid;
                logger.info(`Your Steam User ID: ${ownUserID}`);
                return ownUserID;
            }
            else {
                logger.warn("Unable to retrieve Steam user ID");
                return null;
            }
        }
        catch (error) {
            logger.error(`Error fetching Steam user data: ${error.message}`);
            return null;
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = yield getOwnUserID();
        if (userId) {
            // Do something with the user ID
        }
    });
}
main().catch(err => {
    logger.error(`An error occurred: ${err}`);
});
