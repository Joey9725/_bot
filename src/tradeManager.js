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
exports.handleOffer = void 0;
var steamClient_1 = require("./steamClient");
var logger_1 = require("./logger");
var _a = require('./config'), BOT_NAME = _a.BOT_NAME, OWNER_ID = _a.OWNER_ID, IDENTITY_SECRET = _a.IDENTITY_SECRET;
var logger = new logger_1.Logger(BOT_NAME);
var ETradeOfferState;
(function (ETradeOfferState) {
    ETradeOfferState[ETradeOfferState["Active"] = 2] = "Active";
    // Add other states as needed
})(ETradeOfferState || (ETradeOfferState = {}));
steamClient_1.client.on('webSession', function (sessionid, cookies) {
    steamClient_1.community.setCookies(cookies);
});
steamClient_1.client.on('tradeOffers', function (offers) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, offers_1, offer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.info("Received ".concat(offers.length, " trade offers."));
                _i = 0, offers_1 = offers;
                _a.label = 1;
            case 1:
                if (!(_i < offers_1.length)) return [3 /*break*/, 4];
                offer = offers_1[_i];
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
function handleOffer(offer) {
    return __awaiter(this, void 0, void 0, function () {
        var status_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.info("Received trade offer with ID: ".concat(offer.id, ", state: ").concat(offer.state));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    if (!(offer.state === ETradeOfferState.Active)) return [3 /*break*/, 6];
                    if (!(offer.partner.getSteamID64() === OWNER_ID)) return [3 /*break*/, 3];
                    return [4 /*yield*/, steamClient_1.client.acceptOffer(offer.id)];
                case 2:
                    status_1 = _a.sent();
                    logger.info("Accepted offer ".concat(offer.id, ". Status: ").concat(status_1, "."));
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, steamClient_1.client.declineOffer(offer.id)];
                case 4:
                    _a.sent();
                    logger.info("Declined offer ".concat(offer.id, "."));
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    logger.info("Offer ".concat(offer.id, " is not active. Current state: ").concat(offer.state));
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    logger.error("Error handling offer ".concat(offer.id, ": ").concat(error_1));
                    return [3 /*break*/, 9];
                case 9:
                    if (!offer.requiresMobileConfirmation) return [3 /*break*/, 11];
                    return [4 /*yield*/, confirmMobile(offer)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.handleOffer = handleOffer;
function confirmMobile(offer) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, steamClient_1.community.acceptConfirmationForObject(IDENTITY_SECRET, offer.id)];
                case 1:
                    _a.sent();
                    logger.info("Confirmed mobile confirmation for trade ".concat(offer.id));
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    logger.error("Error confirming mobile confirmation for trade ".concat(offer.id, ": ").concat(error_2.message));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
