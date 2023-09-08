import axios from 'axios';
import { BPTF_API_KEY, BPTF_USER_TOKEN } from './config';
import { Logger } from './logger';

if (!BPTF_API_KEY || !BPTF_USER_TOKEN) {
  throw new Error("API key and/or user token are missing");
}

class BPTFAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BPTFAPIError';
  }
}

const logger = new Logger('BPTFAPI');
const BASE_URL = 'https://backpack.tf/api/';
type MakeRequestParams = Record<string, any>;
let rateLimitResetTime: number = 0;

interface PriceHistoryParams {
  item: string;
  quality: string;
  tradable: string;
  craftable: string;
  priceindex: string;
}

async function makeRequest(endpoint: string, params: MakeRequestParams) {
  try {
    if (Date.now() < rateLimitResetTime) {
      throw new BPTFAPIError('Rate limit exceeded. Please wait.');
    }
    const url = `${BASE_URL}${endpoint}`;
    const clonedParams = { ...params, key: BPTF_API_KEY };
    const headers = {
      'X-Auth-Token': BPTF_USER_TOKEN
    };
    const response = await axios.get(url, { params: clonedParams, headers });

    if (response.headers && response.headers['x-rate-limit-reset']) {
      rateLimitResetTime = Number(response.headers['x-rate-limit-reset']) * 1000;
    } else {
      rateLimitResetTime = Date.now() + 60000; // Set a default value of 1 minute
    }

    if (response.status !== 200) {
      if (response.status === 404) {
        throw new BPTFAPIError('Resource not found');
      } else if (response.status === 500) {
        throw new BPTFAPIError('Internal server error');
      } else {
        throw new BPTFAPIError(`Failed to fetch data: ${response.statusText}`);
      }
    }

    return response.data;
  } catch (error: any) {
    logger.error(`Error fetching data: ${error.message}`);
    throw new BPTFAPIError(`Error fetching data: ${error.message}`);
  }
}

async function getCurrencies(raw = 2) {
  const endpoint = 'IGetCurrencies/v1';
  const params = { raw };
  const data = await makeRequest(endpoint, params);
  if (!data) {
    logger.warn('Failed to retrieve currency data');
    return null;
  }
  return data.currencies;
}

async function getPriceHistory(params: PriceHistoryParams) {
  const {item, quality, tradable, craftable, priceindex} = params;
  const endpoint = 'IGetPrices/v4';
  const newParams = {item, quality, tradable, craftable, priceindex};
  const data = await makeRequest(endpoint, newParams);
  if (!data) {
    logger.warn('Failed to retrieve price history data');
    return [];
  }
  return data.items;
}

async function getSpecialItems(appid = 440) {
  const endpoint = 'IGetSpecialItems/v1';
  const params = {appid};
  const data = await makeRequest(endpoint, params);
  if (!data) {
    logger.warn('Failed to retrieve special items data');
    return null;
  }
  return data.response;
}

async function getUserData(steamid: string) {
  const endpoint = 'IGetUsers/v3';
  const params = {steamid};
  const data = await makeRequest(endpoint, params);
  return data ? data.users[0] : null;
}

async function getPriceSchema(raw = 2, since?: number) {
  const endpoint = 'IGetPrices/v4';
  const params = {raw, since};
  const data = await makeRequest(endpoint, params);
  return data ? data.pricelist : null;
}

async function searchClassifieds(params: Record<string, any>) {
  const endpoint = 'classifieds/search/v1';
  const data = await makeRequest(endpoint, params);
  return data ? data.listings : null;
}

async function getUserListings(steamid: string) {
  const endpoint = `IGetUserTrades/v1/${steamid}`;
  const data = await makeRequest(endpoint, {});
  return data ? data.listings : null;
}

async function getPriceHistoryForItem(appid: string, item: string, quality: string, tradable: string, craftable: string, priceindex: string) {
  const endpoint = 'IGetPriceHistory/v1';
  const params = {appid, item, quality, tradable, craftable, priceindex};
  const data = await makeRequest(endpoint, params);
  if (!data) {
    logger.warn('Failed to retrieve price history for the item');
    return null;
  }
  return data.history;
}

async function getImpersonatedUsers(limit: number, skip: number) {
  const endpoint = 'IGetUsers/GetImpersonatedUsers';
  const params = {limit, skip};
  const data = await makeRequest(endpoint, params);
  if (!data) {
    logger.warn('Failed to retrieve impersonated users');
    return null;
  }
  return data.results;
}

async function searchClassifiedsV1() {
  const endpoint = 'classifieds/search/v1';
  const data = await makeRequest(endpoint, {});
  if (!data) {
    logger.warn('Failed to search classifieds');
    return null;
  }
  return data;
}

async function getUserClassifiedListingLimits() {
  const endpoint = 'classifieds/limits';
  const data = await makeRequest(endpoint, {});
  if (!data) {
    logger.warn('Failed to get user classified listing limits');
    return null;
  }
  return data.listings;
}

async function getNotifications(skip: number, limit: number, unread: number) {
  const endpoint = 'notifications';
  const params = {skip, limit, unread};
  const data = await makeRequest(endpoint, params);
  if (!data) {
    logger.warn('Failed to get notifications');
    return null;
  }
  return data;
}

export {
  makeRequest,
  getCurrencies,
  getPriceHistory,
  getSpecialItems,
  getUserData,
  getPriceSchema,
  searchClassifieds,
  getUserListings,
  getPriceHistoryForItem,
  getImpersonatedUsers,
  searchClassifiedsV1,
  getUserClassifiedListingLimits,
  getNotifications
};