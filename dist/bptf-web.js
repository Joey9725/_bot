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
exports.getSpecialItems = exports.getPriceHistory = exports.getCurrencies = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const logger_1 = require("./logger");
const logger = new logger_1.Logger('BPTFAPI');
const BASE_URL = 'https://backpack.tf/api/';
function makeRequest(endpoint, params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const clonedParams = Object.assign(Object.assign({}, params), { key: config_1.BPTF_API_KEY });
            const headers = {
                'X-Auth-Token': config_1.BPTF_USER_TOKEN
            };
            const response = yield axios_1.default.get(url, { params: clonedParams, headers });
            if (response.status !== 200) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            return response.data;
        }
        catch (error) {
            // Your existing error handling logic here
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
function getPriceHistory(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { item, quality, tradable, craftable, priceindex } = params;
        const endpoint = 'IGetPrices/v4';
        const newParams = { item, quality, tradable, craftable, priceindex };
        const data = yield makeRequest(endpoint, newParams);
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
