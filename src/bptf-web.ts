import { Logger } from "./logger";
import { BaseError, NetworkError } from "./errorHandler";
import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {config as configDotenv} from 'dotenv';
import * as fs from 'fs';
// Import custom error classes


// Load environment variables from .env file
configDotenv();
class LRUCache<K, V> {
    private readonly maxSize: number;
    private cacheMap: Map<K, V>;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.cacheMap = new Map();
    }

    // Get an item from the cache and refresh its position
    get(key: K): V | undefined {
        const item = this.cacheMap.get(key);
        if (item) {
            this.cacheMap.delete(key);
            this.cacheMap.set(key, item);
        }
        return item;
    }

    // Set an item in the cache and remove the oldest item if the cache is full
    set(key: K, value: V): void {
        if (this.cacheMap.size >= this.maxSize) {
            const firstKey = this.cacheMap.keys().next().value;
            this.cacheMap.delete(firstKey);
        }
        this.cacheMap.set(key, value);
    }
}

// Define constants
const BPTF_USER_TOKEN = process.env.BPTF_USER_TOKEN;
const BPTF_API_KEY = process.env.BPTF_API_KEY;
const BASE_URL = 'https://backpack.tf/api/';
const cache = new LRUCache<string, CacheData>(100);

// Define types and classes
type MakeRequestParams = Record<string, any>;
let rateLimitResetTime = 0;

// Define interfaces for API response data
interface ClassifiedListing {
    item_name: string;
    price: number;
    // Add other properties that you expect here
}

interface CacheData {
    data: any; // You can make this more specific depending on your needs
    expireTime: number;
}

interface ResponseData {
    response?: any;
    items?: any;
    listings?: any;
    history?: any;
    results?: any;
    users?: any;
}

interface PriceHistoryParams {
    item: string;
    quality: string;
    tradable: boolean;
    craftable: boolean;
    priceindex: number;
}

// Handle API request errors and retries
async function handleRequestError(
  error: AxiosError,
  endpoint: string,
  params: Record<string, any>,
  method: 'GET' | 'POST',
  retry: number,
  backoff: number
): Promise<any> {
    if (retry > 0) {
        await new Promise<void>(resolve => setTimeout(() => resolve(), backoff));
        return makeRequest(endpoint, params, method, retry - 1, backoff * 2);
    } else {
        // Use custom error classes for specific error handling
        if (error.response) {
            if (error.response.status === 429) {
                new NetworkError(`Rate limit exceeded. Will reset at: ${new Date(rateLimitResetTime)}`, 404);
            } else if (error.response.status === 401) {
                new BaseError(`Authentication failed: ${error.response.statusText}`, 1002);
            } else {
                new NetworkError(`Failed with status code: ${error.response.status}`, 404);
            }
        } else {
            new NetworkError(`Network error: ${error.message}`, 404);
        }
    }
}

// Make a request to the backpack.tf API
async function makeRequest(
  endpoint: string,
  params: Record<string, any>,
  method: 'GET' | 'POST' = 'GET',
  retry = 3,
  backoff = 500
): Promise<any> {
    Logger.info('makeRequest called');
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    const now = Date.now();

    // Check if the rate limit is active and wait if necessary
    if (now < rateLimitResetTime) {
        Logger.info('Rate limit active. Waiting...');
        await new Promise<void>(resolve => setTimeout(() => resolve(), rateLimitResetTime - now));
        return makeRequest(endpoint, params, method, retry, backoff);
    }

    // Check if the data is cached and still valid
    const cachedData = cache.get(cacheKey);
    if (cachedData && cachedData.expireTime > Date.now()) {
        return cachedData.data;
    }

    const url = `${BASE_URL}${endpoint}`;
    const clonedParams = { ...params, key: BPTF_API_KEY };
    const headers = { 'X-Auth-Token': BPTF_USER_TOKEN };

    const axiosConfig: AxiosRequestConfig = {
        url,
        headers,
        method,
        ...(method === 'GET' ? { params: clonedParams } : { data: clonedParams }),
    };

    try {
        const response = await axios.request(axiosConfig);

        if (response.status === 200) {
            cache.set(cacheKey, { data: response.data, expireTime: Date.now() + 3600000 });
            return response.data;
        } else if (response.status === 429) {
            rateLimitResetTime = Date.now() + Number(response.headers['x-rate-limit-reset']);
            return Promise.reject(`Rate limit exceeded. Will reset at: ${new Date(rateLimitResetTime)}`);
        } else {
            return Promise.reject(`Failed with status code: ${response.status}. Headers: ${JSON.stringify(response.headers)}. Body: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        return handleRequestError(error, endpoint, params, method, retry, backoff);
    }
}

// Get price history for an item from the backpack.tf API
async function getPriceHistoryForItem(
  appid: string,
  item: string,
  quality: string,
  tradable: string,
  craftable: string,
  priceindex: string
): Promise<any | null> {
    const endpoint = 'IGetPriceHistory/v1';
    const params = { appid, item, quality, tradable, craftable, priceindex };

    try {
        const data: any | null = await makeRequest(endpoint, params);
        return data ? data.history : null;
    } catch (error) {
        Logger.error(`An error occurred while fetching price history for an item: ${error}`);
        return null;
    }
}


// Get a list of currencies from the backpack.tf API
async function getCurrencies(raw = 2): Promise<ResponseData | null> {
    try {
        const endpoint = 'IGetCurrencies/v1';
        const params = { raw };
        const data: ResponseData | null = await makeRequest(endpoint, params);

        if (!data || !data.response) {
            Logger.info('Failed to retrieve currency data');
            return null;
        }

        return data.response;
    } catch (error) {
        Logger.info(`Error in getCurrencies: ${error}`);
        return null;
    }
}

// Get the price history for an item from the backpack.tf API
async function getPriceHistory(params: PriceHistoryParams): Promise<any[] | null> {
    Logger.info('Entering getPriceHistory');

    const { item, quality, tradable, craftable, priceindex } = params;
    const endpoint = 'IGetPrices/v4';
    const newParams = { item, quality, tradable, craftable, priceindex };

    try {
        const data: any | null = await makeRequest(endpoint, newParams);

        if (!data || !data.items) {
            Logger.info('Returning null because data or data.items is null or undefined');
            return null;
        }

        Logger.info(`Retrieved items: ${data.items}`);
        return data.items;
    } catch (error) {
        Logger.info(`An error occurred while fetching price history: ${error}`);
        return null;
    }
}

// Get a list of special items from the backpack.tf API
async function getSpecialItems(appid = 440): Promise<any | null> {
    const endpoint = 'IGetSpecialItems/v1';
    const params = { appid };

    try {
        const data: any | null = await makeRequest(endpoint, params);
        return data ? data.response : null;
    } catch (error) {
        Logger.error(`An error occurred while fetching special items: ${error}`);
        return null;
    }
}

// Get user data from the backpack.tf API
async function getUserData(steamid: string): Promise<any | null> {
    const endpoint = 'IGetUsers/v3';
    const params = { steamid };

    try {
        const data: any | null = await makeRequest(endpoint, params);
        return data ? data.users : null;
    } catch (error) {
        Logger.error(`An error occurred while fetching user data: ${error}`);
        return null;
    }
}

// Get the price schema from the backpack.tf API
async function getPriceSchema(raw = 2, since?: number): Promise<any | null> {
    const endpoint = 'IGetPrices/v4';
    const params = { raw, since };

    try {
        const data: any | null = await makeRequest(endpoint, params);

        if (!data || !data.response || !data.response.items) {
            Logger.info('Debug: data is null, undefined, or not structured as expected');
            return null;
        }

        // Save only the 'items' part of the response
        fs.writeFileSync('priceSchema.json', JSON.stringify(data.response.items));
        return data.response.items;
    } catch (error) {
        Logger.info(`An error occurred: ${error}`);
        return null;
    }
}

async function getPriceFromSchemaFile(itemName: string): Promise<any | null> {
    try {
        // Read the file
        const fileData = fs.readFileSync('priceSchema.json', 'utf8');

        // Parse the JSON data
        const priceSchema = JSON.parse(fileData);

        // Find the price of the item
        const itemData = priceSchema[itemName];
        if (itemData && itemData.prices) {
            return itemData.prices; // Return the price data for the item
        } else {
            return null; // Item not found in the price schema
        }
    } catch (error) {
        Logger.error(`An error occurred while reading the price schema: ${error}`);
        return null;
    }
}

// Get user listings from the backpack.tf API
async function getUserListings(steamid: string): Promise<any | null> {
    const endpoint = `IGetUserTrades/v1/${steamid}`;

    try {
        const data: any | null = await makeRequest(endpoint, {});
        return data ? data.listings : null;
    } catch (error) {
        Logger.error(`An error occurred while fetching user listings: ${error}`);
        return null;
    }
}

async function getImpersonatedUsers(limit: number, skip: number): Promise<any | null> {
    const endpoint = 'IGetUsers/GetImpersonatedUsers';
    const params = { limit, skip };

    try {
        const data: any | null = await makeRequest(endpoint, params);
        return data ? data.results : null;
    } catch (error) {
        Logger.error(`An error occurred while fetching impersonated users: ${error}`);
        return null;
    }
}

// Get the average buy and sell prices for an item
async function getAveragePriceForItem(itemName: string): Promise<{ buy: { avg: string; min: string; max: string }; sell: { avg: string; min: string; max: string } }> {
    try {
        const endpoint = 'classifieds/search/v1';

        const sellParams = {
            item: itemName,
            key: BPTF_API_KEY,
            intent: 'sell',
            page_size: 1,
            fold: 0,

        };

        const buyParams = {
            item: itemName,
            key: BPTF_API_KEY,
            intent: 'buy',
            page_size: 10,
            fold: 0,

        };

        const axiosConfig: AxiosRequestConfig = {
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'X-Auth-Token': BPTF_USER_TOKEN,
            },
        };

        const [sellResponse, buyResponse] = await Promise.all([
            axios.get(axiosConfig.url, {
                params: sellParams,
                headers: axiosConfig.headers,
            }),
            axios.get(axiosConfig.url, {
                params: buyParams,
                headers: axiosConfig.headers,
            }),
        ]);

        if (sellResponse.status !== 200 || buyResponse.status !== 200) {
            throw new BaseError(`Failed with status code: sell-${sellResponse.status}, buy-${buyResponse.status}`, 1000);
        }

        const sellData = sellResponse.data;
        const buyData = buyResponse.data;

        if (sellData.total > 0 || buyData.total > 0) {
            const sellListings = sellData.sell.listings;
            const buyListings = buyData.buy.listings;

            const sellPrices = sellListings.map((listing: any) => listing.currencies.metal);
            const buyPrices = buyListings.map((listing: any) => listing.currencies.metal);

            let sellPriceInfo: { avg: string; min: string; max: string } | null = null;
            let buyPriceInfo: { avg: string; min: string; max: string } | null = null;

            if (sellPrices.length > 0) {
                const sellTotalPrice = sellPrices.reduce((acc: number, price: number) => acc + price, 0);
                const sellAveragePrice = sellTotalPrice / sellPrices.length;
                const sellMinPrice = Math.min(...sellPrices);
                const sellMaxPrice = Math.max(...sellPrices);
                sellPriceInfo = {
                    avg: sellAveragePrice.toFixed(2),
                    min: sellMinPrice.toFixed(2),
                    max: sellMaxPrice.toFixed(2)
                };
            }

            if (buyPrices.length > 0) {
                const buyTotalPrice = buyPrices.reduce((acc: number, price: number) => acc + price, 0);
                const buyAveragePrice = buyTotalPrice / buyPrices.length;
                const buyMinPrice = Math.min(...buyPrices);
                const buyMaxPrice = Math.max(...buyPrices);
                buyPriceInfo = {
                    avg: buyAveragePrice.toFixed(2),
                    min: buyMinPrice.toFixed(2),
                    max: buyMaxPrice.toFixed(2)
                };
            }

            return { buy: sellPriceInfo, sell: buyPriceInfo };
        } else {
            Logger.info('No sell or buy listings found for the item.');
            return { sell: null, buy: null };
        }
    } catch (error) {
        Logger.error(`An error occurred while fetching classified listings: ${error}`);
        return { sell: null, buy: null };
    }
}

// Get a specific listing by its ID
async function getListingById(id: string): Promise<any | null> {
    const endpoint = `classifieds/listings/${id}`;

    try {
        const data: any | null = await makeRequest(endpoint, {});
        return data || null;
    } catch (error) {
        Logger.error(`An error occurred while fetching a listing by ID: ${error}`);
        return null;
    }
}

// Get user classified listing limits from the backpack.tf API
async function getUserClassifiedListingLimits(): Promise<any | null> {
    const endpoint = 'classifieds/limits';

    try {
        const data: any | null = await makeRequest(endpoint, {});
        return data ? data.listings : null;
    } catch (error) {
        Logger.error(`An error occurred while fetching user classified listing limits: ${error}`);
        return null;
    }
}

// Get notifications from the backpack.tf API
async function getNotifications(skip: number, limit: number, unread: number): Promise<any | null> {
    const endpoint = 'notifications';
    const params = { skip, limit, unread };

    try {
        const data: any | null = await makeRequest(endpoint, params);
        return data || null;
    } catch (error) {
        Logger.error(`An error occurred while fetching notifications: ${error}`);
        return null;
    }
}

// Register an agent with the backpack.tf API
async function registerAgent() {
    const endpoint = 'agent/pulse';

    try {
        const data = await makeRequest(endpoint, {}, "POST");

        Logger.info(`Successfully registered agent: ${data}`);

        return data || null;
    } catch (error) {
        Logger.error(`Failed to register agent: ${error}`);

        throw new BaseError('Failed to register agent', 1000);
    }
}

async function unregisterAgent() {
    const endpoint = 'agent/stop'
    try {
        const data = makeRequest(endpoint, {}, "POST");

        Logger.info(`Successfully unregistered agent: ${data}`);

        return data || null;
    } catch (error) {
        Logger.error(`Failed to unregister agent: ${error}`);

        throw new BaseError('Failed to unregister agent', 1000);
    }
}

// Get the status of an agent from the backpack.tf API
async function getAgentStatus(): Promise<ResponseData | null> {
    const endpoint = 'agent/status';

    try {
        const data: ResponseData | null = await makeRequest(endpoint, {}, 'POST');
        if (!data) {
            Logger.info('Failed to retrieve agent status');
        }
        return data;
    } catch (error) {
        Logger.info(`Error getting agent status: ${error}`);
        return null;
    }
}

export {
    registerAgent,
    unregisterAgent,
    getAgentStatus,
    getListingById,
    getCurrencies,
    getPriceHistory,
    getSpecialItems,
    getUserData,
    getPriceSchema,
    getPriceFromSchemaFile,
    getUserListings,
    getPriceHistoryForItem,
    getImpersonatedUsers,
    getAveragePriceForItem,
    getUserClassifiedListingLimits,
    getNotifications,
};