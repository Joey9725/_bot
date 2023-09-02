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
exports.getSpecialItems = exports.getPrices = exports.getPriceHistory = exports.getCurrencies = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const logger_1 = require("./logger");
const logger = new logger_1.Logger('BPTFAPI');
const BASE_URL = 'https://backpack.tf/api/';
function makeRequest(endpoint, params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const clonedParams = Object.assign(Object.assign({}, params), { key: config_1.BPTF_API_KEY }); // Clone and add API key
            const headers = {
                'X-Auth-Token': config_1.BPTF_USER_TOKEN
            };
            // Debug logs
            logger.debug(`Making request to URL: ${url}`);
            logger.debug(`With parameters: ${JSON.stringify(clonedParams, null, 2)}`);
            logger.debug(`And headers: ${JSON.stringify(headers, null, 2)}`);
            const response = yield axios_1.default.get(url, { params: clonedParams, headers });
            if (response.status !== 200) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            return response.data;
        }
        catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                logger.error(`Error in API request: ${JSON.stringify(error.response.data, null, 2)}`);
            }
            else if (error.request) {
                // The request was made but no response was received
                logger.error(`No response received: ${JSON.stringify(error.request, null, 2)}`);
            }
            else {
                // Something happened in setting up the request that triggered an Error
                logger.error(`Error in API request setup: ${error.message}`);
            }
            return null;
        }
    });
}
function getCurrencies(raw = 2) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetCurrencies/v1';
        const params = { raw };
        const data = yield makeRequest(endpoint, params);
        return data ? data.currencies : null;
    });
}
exports.getCurrencies = getCurrencies;
function getPriceHistory({ item, quality, tradable, craftable, priceindex }) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetPriceHistory/v1';
        const params = {
            appid: 440,
            item,
            quality,
            tradable,
            craftable,
            priceindex // Include the priceindex if available
        };
        function makeRequest(endpoint, params) {
            return __awaiter(this, void 0, void 0, function* () {
                return data ? data.response.history : null;
            });
        }
    });
}
exports.getPriceHistory = getPriceHistory;
function getPriceHistory(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { item, quality, tradable, craftable, priceindex } = params;
        const endpoint = 'IGetPrices/v4';
        const params = { raw, since };
        const data = yield makeRequest(endpoint, params);
        return data ? data.items : null;
    });
}
exports.getPriceHistory = getPriceHistory;
function getSpecialItems(appid = 440) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = 'IGetSpecialItems/v1';
        const params = { appid };
        const data = yield makeRequest(endpoint, params);
        return data ? data.response : null;
    });
}
exports.getSpecialItems = getSpecialItems;
