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
exports.getNotifications = exports.getUserClassifiedListingLimits = exports.searchClassifiedsV1 = exports.getImpersonatedUsers = exports.getPriceHistoryForItem = exports.getUserListings = exports.getPriceSchema = exports.getUserData = exports.getSpecialItems = exports.getPriceHistory = exports.getCurrencies = exports.makeRequest = void 0;
var axios_1 = require("axios");
var config_1 = require("./config");
if (!config_1.BPTF_API_KEY) {
    throw new Error("API key is missing or expired");
}
else if (!config_1.BPTF_USER_TOKEN) {
    throw new Error("User token is missing or expired");
}
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
                        'X-Auth-Token': config_1.BPTF_USER_TOKEN,
                    };
                    return [4 /*yield*/, axios_1.default.get(url, { params: clonedParams, headers: headers })];
                case 1:
                    response = _a.sent();
                    // Check if the response is null
                    if (!response) {
                        console.log("API Response is null");
                        return [2 /*return*/, null]; // Return null if the response is null
                    }
                    console.log('API Response:', response);
                    if (response.status !== 200) {
                        if (response.status === 404) {
                            console.log('Resource not found');
                        }
                        else if (response.status === 500) {
                            console.log('Internal server error');
                        }
                        else {
                            console.log("Failed to fetch data: ".concat(response.statusText));
                        }
                    }
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _a.sent();
                    console.log("An error occurred:", error_1);
                    throw error_1; // Re-throw the error if you want it to propagate
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.makeRequest = makeRequest;
function getCurrencies(raw) {
    if (raw === void 0) { raw = 2; }
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, params, data, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Entering getCurrencies");
                    endpoint = 'IGetCurrencies/v1';
                    params = { raw: raw };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 2:
                    data = _a.sent();
                    if (!data) {
                        console.log('Failed to retrieve data');
                        return [2 /*return*/, null];
                    }
                    response = data.response;
                    console.log('getCurrencies: ', response);
                    if (!response) {
                        console.log('Failed to retrieve currency data');
                        return [2 /*return*/, null];
                    }
                    console.log("Exiting getCurrencies with:", response);
                    return [2 /*return*/, response];
                case 3:
                    error_2 = _a.sent();
                    console.log('Error in getCurrencies:', error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getCurrencies = getCurrencies;
function getPriceHistory(params) {
    return __awaiter(this, void 0, void 0, function () {
        var item, quality, tradable, craftable, priceindex, endpoint, newParams, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Entering getPriceHistory');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    item = params.item, quality = params.quality, tradable = params.tradable, craftable = params.craftable, priceindex = params.priceindex;
                    endpoint = 'IGetPrices/v4';
                    newParams = { item: item, quality: quality, tradable: tradable, craftable: craftable, priceindex: priceindex };
                    return [4 /*yield*/, makeRequest(endpoint, newParams)];
                case 2:
                    data = _a.sent();
                    // Check if data is null or undefined
                    if (!data) {
                        console.log('Failed to retrieve price history data');
                        return [2 /*return*/, []]; // Return null if data is null
                    }
                    // Check if data.items is null or undefined
                    if (!data.items) {
                        console.log('Items property is null or undefined');
                        return [2 /*return*/, []]; // Return null if data.items is null
                    }
                    // Log the items for debugging
                    console.log('Retrieved items:', data.items);
                    console.log('exiting getPriceHistory');
                    return [2 /*return*/, data.items];
                case 3:
                    error_3 = _a.sent();
                    // Log any errors that occur
                    console.log('An error occurred while fetching price history:', error_3);
                    // You can choose to re-throw the error if you want it to propagate
                    throw error_3;
                case 4: return [2 /*return*/];
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
                    if (!data) {
                        console.log('Failed to retrieve special items data');
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, data.response];
            }
        });
    });
}
exports.getSpecialItems = getSpecialItems;
function getUserData(steamid) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, params, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'IGetUsers/v3';
                    params = { steamid: steamid };
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, data ? data.users[0] : null];
            }
        });
    });
}
exports.getUserData = getUserData;
function getPriceSchema(raw, since) {
    if (raw === void 0) { raw = 2; }
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, params, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'IGetPrices/v4';
                    params = { raw: raw, since: since };
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, data ? data.pricelist : null];
            }
        });
    });
}
exports.getPriceSchema = getPriceSchema;
function getUserListings(steamid) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = "IGetUserTrades/v1/".concat(steamid);
                    return [4 /*yield*/, makeRequest(endpoint, {})];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, data ? data.listings : null];
            }
        });
    });
}
exports.getUserListings = getUserListings;
function getPriceHistoryForItem(appid, item, quality, tradable, craftable, priceindex) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, params, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'IGetPriceHistory/v1';
                    params = { appid: appid, item: item, quality: quality, tradable: tradable, craftable: craftable, priceindex: priceindex };
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 1:
                    data = _a.sent();
                    if (!data) {
                        console.log('Failed to retrieve price history for the item');
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, data.history];
            }
        });
    });
}
exports.getPriceHistoryForItem = getPriceHistoryForItem;
function getImpersonatedUsers(limit, skip) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, params, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'IGetUsers/GetImpersonatedUsers';
                    params = { limit: limit, skip: skip };
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 1:
                    data = _a.sent();
                    if (!data) {
                        console.log('Failed to retrieve impersonated users');
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, data.results];
            }
        });
    });
}
exports.getImpersonatedUsers = getImpersonatedUsers;
function searchClassifiedsV1() {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'classifieds/search/v1';
                    return [4 /*yield*/, makeRequest(endpoint, {})];
                case 1:
                    data = _a.sent();
                    if (!data) {
                        console.log('Failed to search classifieds');
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.searchClassifiedsV1 = searchClassifiedsV1;
function getUserClassifiedListingLimits() {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'classifieds/limits';
                    return [4 /*yield*/, makeRequest(endpoint, {})];
                case 1:
                    data = _a.sent();
                    if (!data) {
                        console.log('Failed to get user classified listing limits');
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, data.listings];
            }
        });
    });
}
exports.getUserClassifiedListingLimits = getUserClassifiedListingLimits;
function getNotifications(skip, limit, unread) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, params, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = 'notifications';
                    params = { skip: skip, limit: limit, unread: unread };
                    return [4 /*yield*/, makeRequest(endpoint, params)];
                case 1:
                    data = _a.sent();
                    if (!data) {
                        console.log('Failed to get notifications');
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.getNotifications = getNotifications;
