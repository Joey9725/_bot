import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';

const BPTF_USER_TOKEN = process.env.BPTF_USER_TOKEN;
const BPTF_API_KEY = process.env.BPTF_API_KEY;

const BASE_URL = 'https://backpack.tf/api/';

type MakeRequestParams = Record<string, any>;

let rateLimitResetTime = 0;

class LRUCache<K, V> {
    private maxSize: number;
    private cacheMap: Map<K, V>;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.cacheMap = new Map();
    }

    get(key: K): V | undefined {
        const item = this.cacheMap.get(key);
        if (item) {
            this.cacheMap.delete(key);
            this.cacheMap.set(key, item);
        }
        return item;
    }

    set(key: K, value: V): void {
        if (this.cacheMap.size >= this.maxSize) {
            const firstKey = this.cacheMap.keys().next().value;
            this.cacheMap.delete(firstKey);
        }
        this.cacheMap.set(key, value);
    }
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

const cache = new LRUCache<string, CacheData>(100);

// Make a request to the backpack.tf API
async function makeRequest(
    endpoint: string,
    params: Record<string, any>,
    method: 'GET' | 'POST' = 'GET',
    retry = 3,
    backoff = 500
): Promise<any> {
    console.log('makeRequest called');
    return new Promise((resolve, reject) => {
        const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
        const now = Date.now();

        if (now < rateLimitResetTime) {
            console.log('Rate limit active. Waiting...');
            setTimeout(
                () => resolve(makeRequest(endpoint, params, method, retry, backoff)),
                rateLimitResetTime - now
            );
            return;
        }

        const cachedData = cache.get(cacheKey);
        if (cachedData && cachedData.expireTime > Date.now()) {
            resolve(cachedData.data);
            return;
        }

        const url = `${BASE_URL}${endpoint}`;
        const clonedParams = { ...params, key: BPTF_API_KEY };
        const headers = { 'X-Auth-Token': BPTF_USER_TOKEN };

        const axiosConfig: AxiosRequestConfig = { url, headers, method };

        if (method === 'GET') {
            axiosConfig.params = clonedParams;
        } else if (method === 'POST') {
            axiosConfig.data = clonedParams;
        }

        axios.request(axiosConfig)
            .then(response => {
                if (response.status === 200) {
                    cache.set(cacheKey, { data: response.data, expireTime: Date.now() + 3600000 });
                    resolve(response.data);
                } else if (response.status === 429) {
                    rateLimitResetTime = Date.now() + Number(response.headers['x-rate-limit-reset']);
                    reject(`Rate limit exceeded. Will reset at: ${new Date(rateLimitResetTime)}`);
                } else {
                    reject(`Failed with status code: ${response.status}. Headers: ${JSON.stringify(response.headers)}. Body: ${JSON.stringify(response.data)}`);
                }
            })
            .catch(error => {
                if (retry > 0) {
                    setTimeout(
                        () => resolve(makeRequest(endpoint, params, method, retry - 1, backoff * 2)),
                        backoff
                    );
                } else {
                    reject(`Max retries reached. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
                }
            });
    }).catch(error => {
        return Promise.reject(error);
    });
}

// Get a list of currencies from the backpack.tf API
async function getCurrencies(raw = 2): Promise<ResponseData | null> {
    try {
        const endpoint = 'IGetCurrencies/v1';
        const params = { raw };
        const data: ResponseData = await makeRequest(endpoint, params);

        // Consistent error logging
        if (!data || !data.response) {
            console.log('Failed to retrieve currency data');
            return null;
        }
        return data.response;
    } catch (error) {
        console.log('Error in getCurrencies:', error);
        return null;
    }
}

// Get the price history for an item from the backpack.tf API
function getPriceHistory(params: PriceHistoryParams): Promise<any[] | null> {
    console.log('Entering getPriceHistory');

    const { item, quality, tradable, craftable, priceindex } = params;
    const endpoint = 'IGetPrices/v4';
    const newParams = { item, quality, tradable, craftable, priceindex };

    return makeRequest(endpoint, newParams)
        .then(data => {
            //console.log('Data received in getPriceHistory:', data);

            if (!data || !data.items) {
                console.log(
                    'Returning null because data or data.items is null or undefined'
                );
                return null;
            }

            console.log('Retrieved items:', data.items);
            return data.items;
        })
        .catch(error => {
            console.log('An error occurred while fetching price history:', error);
            return null;
        });
}

// Get a list of special items from the backpack.tf API
function getSpecialItems(appid = 440): Promise<any | null> {
    const endpoint = 'IGetSpecialItems/v1';
    const params = { appid };

    return makeRequest(endpoint, params)
        .then(data => (data ? data.response : null))
        .catch(_ => null);
}

// Get user data from the backpack.tf API
function getUserData(steamid: string): Promise<any | null> {
    const endpoint = 'IGetUsers/v3';
    const params = { steamid };

    return makeRequest(endpoint, params)
        .then(data => (data ? data.users : null))
        .catch(_ => null);
}

// Get the price schema from the backpack.tf API
function getPriceSchema(raw = 2, since?: number): Promise<any | null> {
    const endpoint = 'IGetPrices/v4';
    const params = { raw, since };

    return makeRequest(endpoint, params)
        .then(data => {
            if (
                !data ||
                !data.response ||
                !data.response.items
            ) {
                console.log('Debug: data is null, undefined, or not structured as expected');
                return null;
            }

            // Save only the 'items' part of the response
            fs.writeFileSync('priceSchema.json', JSON.stringify(data.response.items));
            return data.response.items;
        })
        .catch(error => {
            console.log('An error occurred:', error);
            return null;
        });
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
        console.error('An error occurred while reading the price schema:', error);
        return null;
    }
}

function getUserListings(steamid: string): Promise<any | null> {
    const endpoint = `IGetUserTrades/v1/${steamid}`;

    return makeRequest(endpoint, {})
        .then(data => (data ? data.listings : null))
        .catch(_ => null);
}

function getPriceHistoryForItem(
    appid: string,
    item: string,
    quality: string,
    tradable: string,
    craftable: string,
    priceindex: string
): Promise<any | null> {
    const endpoint = 'IGetPriceHistory/v1';
    const params = { appid, item, quality, tradable, craftable, priceindex };

    return makeRequest(endpoint, params)
        .then(data => (data ? data.history : null))
        .catch(_ => null);
}

function getImpersonatedUsers(limit: number, skip: number): Promise<any | null> {
    const endpoint = 'IGetUsers/GetImpersonatedUsers';
    const params = { limit, skip };

    return makeRequest(endpoint, params)
        .then(data => (data ? data.results : null))
        .catch(_ => null);
}

async function getAveragePriceForItem(itemName: string): Promise<{ buy: number | null, sell: number | null }> {
    try {
        const endpoint = 'classifieds/search/v1';

        const sellParams = {
            item: itemName,
            key: BPTF_API_KEY,
            intent: 'sell',
            page_size: 10,
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

        const sellResponse = await axios.get(axiosConfig.url, {
            params: sellParams,
            headers: axiosConfig.headers,
        });

        const buyResponse = await axios.get(axiosConfig.url, {
            params: buyParams,
            headers: axiosConfig.headers,
        });

        if (sellResponse.status !== 200 || buyResponse.status !== 200) {
            throw new Error(`Failed with status code: sell-${sellResponse.status}, buy-${buyResponse.status}`);
        }

        const sellData = sellResponse.data;
        const buyData = buyResponse.data;

        if (sellData.total > 0 || buyData.total > 0) {
            const sellListings = sellData.sell.listings;
            const buyListings = buyData.buy.listings;

            const sellPrices = sellListings.map((listing: any) => listing.currencies.metal);
            const buyPrices = buyListings.map((listing: any) => listing.currencies.metal);

            const sellTotalPrice = sellPrices.reduce((acc: number, price: number) => acc + price, 0);
            const buyTotalPrice = buyPrices.reduce((acc: number, price: number) => acc + price, 0);

            const sellAveragePrice = sellPrices.length > 0 ? sellTotalPrice / sellPrices.length : null;
            const buyAveragePrice = buyPrices.length > 0 ? buyTotalPrice / buyPrices.length : null;

            return { sell: sellAveragePrice, buy: buyAveragePrice };
        } else {
            console.log('No sell or buy listings found for the item.');
            return { sell: null, buy: null };
        }
    } catch (error) {
        console.error('An error occurred while fetching classified listings:', error);
        return { sell: null, buy: null };
    }
}

function getListingById(id: string): Promise<any | null> {
    const endpoint = `classifieds/listings/${id}`;

    return makeRequest(endpoint, {})
        .then(data => data || null)
        .catch(_ => null);
}

function getUserClassifiedListingLimits(): Promise<any | null> {
    const endpoint = 'classifieds/limits';

    return makeRequest(endpoint, {})
        .then(data => (data ? data.listings : null))
        .catch(_ => null);
}

function getNotifications(skip: number, limit: number, unread: number): Promise<any | null> {
    const endpoint = 'notifications';
    const params = { skip, limit, unread };

    return makeRequest(endpoint, params)
        .then(data => data || null)
        .catch(_ => null);
}

// In the registerAgent function, specify that you're making a POST request
function registerAgent(): Promise<any | null> {
    const endpoint = 'agent/pulse';

    // Specify 'POST' as the HTTP method
    return makeRequest(endpoint, {}, 'POST') // Use 'POST' method
        .then(data => {
            console.log('Agent registered:', data);
            return data;
        })
        .catch(error => {
            console.error('Error registering agent:', error);
            return null;
        });
}

function unregisterAgent() {
    const endpoint = 'agent/stop';

    return makeRequest(endpoint, {})
        .then(data => {
            console.log('Agent unregistered:', data);
            return data;
        })
        .catch(error => {
            console.error('Error unregistering agent:', error);
            return null;
        });
}

async function getAgentStatus(): Promise<ResponseData | null> {
    try {
        const endpoint = 'agent/status';
        const data: ResponseData = await makeRequest(endpoint, {}, 'POST');
        if (!data) {
            console.log('Failed to retrieve agent status');
            return null;
        }
        return data;
    } catch (error) {
        console.log('Error getting agent status:', error);
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