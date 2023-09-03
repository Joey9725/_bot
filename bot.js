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
var _this = this;
var _a = require('./steamClient'), client = _a.client, loginToSteam = _a.loginToSteam, community = _a.community;
var SteamUser = require('steam-user');
var getPriceHistory = require('./backpacktf').getPriceHistory;
var Logger = require('./logger');
var _b = require('./config'), STEAM_ERROR_CODES = _b.STEAM_ERROR_CODES, BOT_NAME = _b.BOT_NAME;
var handleSteamError = require('./utils').handleSteamError;
var logger = new Logger(BOT_NAME);
var currentRetry = 0;
var retryInterval = 10000; // 10 seconds
client.on('loggedOn', function () {
    logger.info('Bot is online!');
    currentRetry = 0; // Reset retry count on successful login
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed([440, "beep...TRADING...boop"]);
});
client.on('webSession', function (sessionid, cookies) {
    community.setCookies(cookies);
});
client.on('error', function (err) {
    if (err.message === 'RateLimitExceeded') {
        var waitTime = Math.pow(2, currentRetry) * retryInterval;
        logger.error("Rate limited by Steam. Retrying in ".concat(waitTime / 1000, " seconds."));
        setTimeout(loginToSteam, waitTime);
        currentRetry++;
    }
    else {
        logger.error("There was an error logging into Steam: ".concat(err.message));
    }
});
loginToSteam();
// PRICES TEST
function test() {
    return __awaiter(this, void 0, void 0, function () {
        var prices, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getPriceHistory({
                            item: 'Team Captain',
                            quality: 'Unusual',
                            tradable: 'Tradable',
                            craftable: 'Craftable',
                            priceindex: '34' // Replace with the actual price index
                        })];
                case 1:
                    prices = _a.sent();
                    console.log(prices);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    logger.error('Error fetching prices');
                    logger.error("Error Details: ".concat(JSON.stringify(error_1, null, 2)));
                    if (error_1.response) {
                        logger.info('Error Response:', JSON.stringify(error_1.response.data, null, 2));
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
test();
// ERROR HANDLING
client.on('error', function (err) {
    logger.error("There was an error logging into Steam: ".concat(err.message));
});
client.on('friendMessage', function (steamID, message) {
    // Handle incoming messages from friends
    // You can add your message handling logic here
    console.log("Received message from ".concat(steamID.getSteamID64(), ": ").concat(message));
});
client.on('tradeOffers', function (offers) { return __awaiter(_this, void 0, void 0, function () {
    var offerArray, _i, offerArray_1, offer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Received trade offers:', offers);
                offerArray = Object.values(offers);
                _i = 0, offerArray_1 = offerArray;
                _a.label = 1;
            case 1:
                if (!(_i < offerArray_1.length)) return [3 /*break*/, 4];
                offer = offerArray_1[_i];
                return [4 /*yield*/, handleOffer(offer)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); });
process.on('uncaughtException', function (err) {
    logger.error("Uncaught exception: ".concat(err.message));
    process.exit(1);
});
process.on('unhandledRejection', function (reason, promise) {
    var errorMessage = "Unhandled promise rejection: Reason: ".concat(reason.stack || reason);
    logger.error(errorMessage);
});
