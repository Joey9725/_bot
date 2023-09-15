import axios from 'axios';
import {BPTF_USER_TOKEN, BPTF_API_KEY} from './config';
import * as fs from "fs";

const BASE_URL = 'https://backpack.tf/api/';
type MakeRequestParams = Record<string, any>;
let rateLimitResetTime = 0;

interface PriceHistoryParams {
  item: string;
  quality: string;
  tradable: boolean;
  craftable: boolean;
  priceindex: number;
}

export const cache = new Map<string, any>();

function makeRequest(endpoint: string, params: Record<string, any>, retry = 3, backoff = 500): Promise<any> {
  console.log("makeRequest called");
  return new Promise((resolve, reject) => {
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    const now = Date.now();

    if (now < rateLimitResetTime) {
      console.log("Rate limit active. Waiting...");
      setTimeout(() => resolve(makeRequest(endpoint, params, retry, backoff)), rateLimitResetTime - now);
      return;
    }

    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      console.log("Cached Data:", cachedData);
      if (cachedData.expireTime > Date.now()) {
        resolve(cachedData.data);
        return;
      }
    }

    const url = `${BASE_URL}${endpoint}`;
    const clonedParams = { ...params, key: BPTF_API_KEY };
    const headers = {
      'X-Auth-Token': BPTF_USER_TOKEN,
    };

    console.log("Before axios call");
    axios.get(url, { params: clonedParams, headers })
        .then(response => {
          console.log("Inside axios then block", response);
          if (response.status !== 200) {
            if (response.status === 429) {
              rateLimitResetTime = Date.now() + Number(response.headers["x-rate-limit-reset"]);
            }
            reject(`Failed with status code: ${response.status}`);
            return;
          }

          // Cache data with expiry time of 1 hour (3600000 milliseconds)
          cache.set(cacheKey, { data: response.data, expireTime: Date.now() + 3600000 });
          resolve(response.data);
        })
        .catch(error => {
          console.log("Inside axios catch block", error);
          if (retry > 0) {
            console.log(`Retrying... (${retry} attempts left)`);
            setTimeout(() => resolve(makeRequest(endpoint, params, retry - 1, backoff * 2)), backoff);
          } else {
            console.log("Max retries reached. Rejecting promise.");
            reject(error);
          }
        });
    console.log("After axios call");
  })
      .catch(error => {
        console.error('An error occurred:', error);
        return Promise.reject(error);
      });
}

function getCurrencies(raw = 2): Promise<any[] | null> {
  const endpoint = 'IGetCurrencies/v1';
  const params = { raw };

  return makeRequest(endpoint, params)
      .then(data => {
        if (!data || !data.response) {
          console.log('Failed to retrieve currency data');
          return null;
        }
        return data.response;
      })
      .catch(error => {
        console.log('Error in getCurrencies:', error);
        return null;
      });
}

function getPriceHistory(params: PriceHistoryParams): Promise<any[] | null> {
  console.log('Entering getPriceHistory');
  const { item, quality, tradable, craftable, priceindex } = params;
  const endpoint = 'IGetPrices/v4';
  const newParams = { item, quality, tradable, craftable, priceindex };

  return makeRequest(endpoint, newParams)
      .then(data => {
        console.log('Data received in getPriceHistory:', data);

        if (!data || !data.items) {
          console.log('Returning null because data or data.items is null or undefined');
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

function getSpecialItems(appid = 440): Promise<any | null> {
  const endpoint = 'IGetSpecialItems/v1';
  const params = { appid };

  return makeRequest(endpoint, params)
      .then(data => data ? data.response : null)
      .catch(_ => null);
}

function getUserData(steamid: string): Promise<any | null> {
  const endpoint = 'IGetUsers/v3';
  const params = { steamid };

  return makeRequest(endpoint, params)
      .then(data => data ? data.users[0] : null)
      .catch(_ => null);
}

function getPriceSchema(raw = 2, since?: number): Promise<any | null> {
    const endpoint = 'IGetPrices/v4';
    const params = { raw, since };

    return makeRequest(endpoint, params)
        .then(data => {
            if (!data || !data.response || !data.response.items) {
                console.log("Debug: data is null, undefined, or not structured as expected");
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

function getPriceFromSchemaFile(itemName: string): any {
    try {
        // Read the file
        const fileData = fs.readFileSync('priceSchema.json', 'utf8');

        // Parse the JSON data
        const priceSchema = JSON.parse(fileData);

        // Find the price of the item
        const itemData = priceSchema[itemName];
        if (itemData && itemData.prices) {
            return itemData.prices;  // Return the price data for the item
        } else {
            return null;  // Item not found in the price schema
        }
    } catch (error) {
        console.error('An error occurred while reading the price schema:', error);
        return null;
    }
}


function getUserListings(steamid: string): Promise<any | null> {
  const endpoint = `IGetUserTrades/v1/${steamid}`;

  return makeRequest(endpoint, {})
      .then(data => data ? data.listings : null)
      .catch(_ => null);
}

function getPriceHistoryForItem(appid: string, item: string, quality: string, tradable: string, craftable: string, priceindex: string): Promise<any | null> {
  const endpoint = 'IGetPriceHistory/v1';
  const params = { appid, item, quality, tradable, craftable, priceindex };

  return makeRequest(endpoint, params)
      .then(data => data ? data.history : null)
      .catch(_ => null);
}

function getImpersonatedUsers(limit: number, skip: number): Promise<any | null> {
  const endpoint = 'IGetUsers/GetImpersonatedUsers';
  const params = { limit, skip };

  return makeRequest(endpoint, params)
      .then(data => data ? data.results : null)
      .catch(_ => null);
}

function searchClassifiedsV1(): Promise<any | null> {
  const endpoint = 'classifieds/search/v1';

  return makeRequest(endpoint, {})
      .then(data => data || null)
      .catch(_ => null);
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
      .then(data => data ? data.listings : null)
      .catch(_ => null);
}

function getNotifications(skip: number, limit: number, unread: number): Promise<any | null> {
  const endpoint = 'notifications';
  const params = { skip, limit, unread };

  return makeRequest(endpoint, params)
      .then(data => data || null)
      .catch(_ => null);
}

function getClassifiedListings(): Promise<any | null> {
    const endpoint = 'v2/classifieds/listings';
    return makeRequest(endpoint, {})
        .then(data => data || null)
        .catch(_ => null);
}


export {
  getClassifiedListings,
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
  searchClassifiedsV1,
  getUserClassifiedListingLimits,
  getNotifications
};