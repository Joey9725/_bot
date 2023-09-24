import {Logger} from "./logger";
import {BaseError, NetworkError} from "./errorHandler";
import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {config as configDotenv} from 'dotenv';
import {
    CacheData,
    RawCurrencyData,
    PriceHistoryParams,
    PriceHistoryData,
    ClassifiedSearchResponse,
    ResponseData
} from './interfaces';

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

if (!BPTF_USER_TOKEN || !BPTF_API_KEY) {
    throw new BaseError("Environment variables BPTF_USER_TOKEN and BPTF_API_KEY must be set", 1001);
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
            rateLimitResetTime = Date.now() + Number(response.headers['x-rate-limit-reset']) * 1000; // Update this line
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
async function getPriceHistory(
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
        return;
    }
}

export async function getCurrencies(raw = 2): Promise<RawCurrencyData[] | null> {
    try {
        const endpoint = 'IGetCurrencies/v1';
        const params = { raw };
        const data: { response: { currencies: Record<string, RawCurrencyData> } } | null = await makeRequest(endpoint, params);

        // Add a debug log here to show what's coming back from the API
        Logger.debug(`Raw API Response for Currencies: ${JSON.stringify(data)}`);

        if (!data || !data.response || !data.response.currencies) {
            Logger.info('Failed to retrieve currency data');
            return null;
        }

        // Convert the response into an array of RawCurrencyData
        const currencies: RawCurrencyData[] = Object.values(data.response.currencies);

        return currencies;
    } catch (error) {
        Logger.error(`An error occurred in getCurrencies: ${error}`);
        return null;
    }
}

export async function getSpecialItems(appid = 440): Promise<any[] | null> {
    const endpoint = 'IGetSpecialItems/v1';
    const params = { appid };

    try {
        const data: any | null = await makeRequest(endpoint, params);
        if (data && data.response && data.response.items) {
            return data.response.items;
        } else {
            Logger.warn('No special items retrieved.');
            return null;
        }
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

async function searchClassifieds(itemName: string, intent: string): Promise<ClassifiedSearchResponse | null> {
    try {
        const endpoint = 'classifieds/search/v1';
        const params = {
            item: itemName,
            key: BPTF_API_KEY,  // Make sure BPTF_API_KEY is defined somewhere in your code
            intent: intent,
            page_size: 10,
            fold: 1,
        };

        const response = await axios.get(`${BASE_URL}${endpoint}`, { params: params });

        if (response.status === 200) {
            return response.data as ClassifiedSearchResponse;
        } else {
            return null;
        }
    } catch (error) {
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
        const data = await makeRequest(endpoint, {}, "POST");

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
    getPriceHistory,
    getUserData,
    getUserListings,
    getImpersonatedUsers,
    searchClassifieds,
    getUserClassifiedListingLimits,
    getNotifications,
};