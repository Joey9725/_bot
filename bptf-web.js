"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialItems = exports.getPrices = exports.getPriceHistory = exports.getCurrencies = void 0;
var axios_1 = require("axios");
var config_1 = require("./config");
var logger_1 = require("./logger");
var logger = new logger_1.Logger('BPTFAPI');
var BASE_URL = 'https://backpack.tf/api/';
function makeRequest(endpoint, params) {
    return __awaiter(this, void 0, void 0, function () {
        var url, clonedParams, headers, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    url = "".concat(BASE_URL).concat(endpoint);
                    clonedParams = __assign(__assign({}, params), { key: config_1.BPTF_API_KEY });
                    headers = {
                        'X-Auth-Token': config_1.BPTF_USER_TOKEN
                    };
                    // Debug logs
                    logger.debug("Making request to URL: ".concat(url));
                    logger.debug("With parameters: ".concat(JSON.stringify(clonedParams, null, 2)));
                    logger.debug("And headers: ".concat(JSON.stringify(headers, null, 2)));
                    return [4 /*yield*/, axios_1.default.get(url, { params: clonedParams, headers: headers })];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Failed to fetch data: ".concat(response.statusText));
                    }
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _a.sent();
                    if (error_1.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        logger.error("Error in API request: ".concat(JSON.stringify(error_1.response.data, null, 2)));
                    }
                    else if (error_1.request) {
                        // The request was made but no response was received
                        logger.error("No response received: ".concat(JSON.stringify(error_1.request, null, 2)));
                    }
                    else {
                        // Something happened in setting up the request that triggered an Error
                        logger.error("Error in API request setup: ".concat(error_1.message));
                    }
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getCurrencies(raw) {
    if (raw === void 0) { raw = 2; }
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, params, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'IGetCurrencies/v1';
                    params = { raw: raw };
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, data ? data.currencies : null];
            }
        });
    });
}
exports.getCurrencies = getCurrencies;
function getPriceHistory(_a) {
    var item = _a.item, quality = _a.quality, tradable = _a.tradable, craftable = _a.craftable, priceindex = _a.priceindex;
    return __awaiter(this, void 0, void 0, function () {
        function makeRequest(endpoint, params) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, data ? data.response.history : null];
                });
            });
        }
        var endpoint, params;
        return __generator(this, function (_b) {
            endpoint = 'IGetPriceHistory/v1';
            params = {
                appid: 440,
                item: item,
                quality: quality,
                tradable: tradable,
                craftable: craftable,
                priceindex: priceindex // Include the priceindex if available
            };
            return [2 /*return*/];
        });
    });
}
exports.getPriceHistory = getPriceHistory;
function getPriceHistory(params) {
    return __awaiter(this, void 0, void 0, function () {
        var item, quality, tradable, craftable, priceindex, endpoint, params, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    item = params.item, quality = params.quality, tradable = params.tradable, craftable = params.craftable, priceindex = params.priceindex;
                    endpoint = 'IGetPrices/v4';
                    params = { raw: raw, since: since };
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, data ? data.items : null];
            }
        });
    });
}
exports.getPriceHistory = getPriceHistory;
function getSpecialItems(appid) {
    if (appid === void 0) { appid = 440; }
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, params, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'IGetSpecialItems/v1';
                    params = { appid: appid };
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, data ? data.response : null];
            }
        });
    });
}
exports.getSpecialItems = getSpecialItems;
