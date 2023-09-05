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
exports.getNotifications = exports.getUserClassifiedListingLimits = exports.searchClassifiedsV1 = exports.getImpersonatedUsers = exports.getPriceHistoryForItem = exports.getPriceHistory = exports.searchClassifieds = exports.getUserData = exports.getPriceSchema = exports.getUserListings = exports.getSpecialItems = exports.getCurrencies = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const logger_1 = require("./logger");
if (!config_1.BPTF_API_KEY || !config_1.BPTF_USER_TOKEN) {
    throw new Error("API key and/or user token are missing");
}
const logger = new logger_1.Logger('BPTFAPI');
const BASE_URL = 'https://backpack.tf/api/';
// Variable to store the rate limit reset time
let rateLimitResetTime = 0;
function makeRequest(endpoint, params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the rate limit has been exceeded
            if (Date.now() < rateLimitResetTime) {
                throw new Error('Rate limit exceeded. Please wait.');
            }
            const url = `${BASE_URL}${endpoint}`;
            const clonedParams = Object.assign(Object.assign({}, params), { key: config_1.BPTF_API_KEY });
            const headers = {
                'X-Auth-Token': config_1.BPTF_USER_TOKEN
            };
            const response = yield axios_1.default.get(url, { params: clonedParams, headers });
            // Update the rate limit reset time
            if (response.headers['x-rate-limit-reset']) {
                rateLimitResetTime = Number(response.headers['x-rate-limit-reset']) * 1000;
            }
            if (response.status !== 200) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            return response.data;
        }
        catch (error) {
            logger.error(`Error fetching data: ${error.message}`);
            return null;
        }
    });
}
function getCurrencies(raw = 2) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetCurrencies/v1';
        const params = { raw };
        const data = yield makeRequest(endpoint, params);
        if (!data) {
            logger.warn('Failed to retrieve currency data');
            return null;
        }
        return data.currencies;
    });
}
exports.getCurrencies = getCurrencies;
function getPriceHistory(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { item, quality, tradable, craftable, priceindex } = params;
        const endpoint = 'IGetPrices/v4';
        const newParams = { item, quality, tradable, craftable, priceindex };
        const data = yield makeRequest(endpoint, newParams);
        if (!data) {
            logger.warn('Failed to retrieve price history data');
            return null;
        }
        return data.items;
    });
}
exports.getPriceHistory = getPriceHistory;
function getSpecialItems(appid = 440) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetSpecialItems/v1';
        const params = { appid };
        const data = yield makeRequest(endpoint, params);
        if (!data) {
            logger.warn('Failed to retrieve special items data');
            return null;
        }
        return data.response;
    });
}
exports.getSpecialItems = getSpecialItems;
function getUserData(steamid) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetUsers/v3';
        const params = { steamid };
        const data = yield makeRequest(endpoint, params);
        return data ? data.users[0] : null;
    });
}
exports.getUserData = getUserData;
function getPriceSchema(raw = 2, since) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetPrices/v4';
        const params = { raw, since };
        const data = yield makeRequest(endpoint, params);
        return data ? data.pricelist : null;
    });
}
exports.getPriceSchema = getPriceSchema;
function searchClassifieds(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'classifieds/search/v1';
        const data = yield makeRequest(endpoint, params);
        return data ? data.listings : null;
    });
}
exports.searchClassifieds = searchClassifieds;
function getUserListings(steamid) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `IGetUserTrades/v1/${steamid}`;
        const data = yield makeRequest(endpoint, {});
        return data ? data.listings : null;
    });
}
exports.getUserListings = getUserListings;
function getPriceHistoryForItem(appid, item, quality, tradable, craftable, priceindex) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetPriceHistory/v1';
        const params = { appid, item, quality, tradable, craftable, priceindex };
        const data = yield makeRequest(endpoint, params);
        if (!data) {
            logger.warn('Failed to retrieve price history for the item');
            return null;
        }
        return data.history;
    });
}
exports.getPriceHistoryForItem = getPriceHistoryForItem;
function getImpersonatedUsers(limit, skip) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetUsers/GetImpersonatedUsers';
        const params = { limit, skip };
        const data = yield makeRequest(endpoint, params);
        if (!data) {
            logger.warn('Failed to retrieve impersonated users');
            return null;
        }
        return data.results;
    });
}
exports.getImpersonatedUsers = getImpersonatedUsers;
function searchClassifiedsV1() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'classifieds/search/v1';
        const data = yield makeRequest(endpoint, {});
        if (!data) {
            logger.warn('Failed to search classifieds');
            return null;
        }
        return data;
    });
}
exports.searchClassifiedsV1 = searchClassifiedsV1;
function getUserClassifiedListingLimits() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'classifieds/limits';
        const data = yield makeRequest(endpoint, {});
        if (!data) {
            logger.warn('Failed to get user classified listing limits');
            return null;
        }
        return data.listings;
    });
}
exports.getUserClassifiedListingLimits = getUserClassifiedListingLimits;
function getNotifications(skip, limit, unread) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'notifications';
        const params = { skip, limit, unread };
        const data = yield makeRequest(endpoint, params);
        if (!data) {
            logger.warn('Failed to get notifications');
            return null;
        }
        return data;
    });
}
exports.getNotifications = getNotifications;
