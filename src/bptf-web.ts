import axios from 'axios';
import rateLimit from 'axios-rate-limit'
import { BPTF_API_KEY, BPTF_USER_TOKEN } from './config';
console.log(BPTF_USER_TOKEN, BPTF_API_KEY)
if (!BPTF_API_KEY) {
  console.error("API key is missing or expired");
}
else if (!BPTF_USER_TOKEN) {
  console.error("User token is missing or expired")
}

const BASE_URL = 'https://backpack.tf/api/';
type MakeRequestParams = Record<string, any>;

interface PriceHistoryParams {
  item: string;
  quality: string;
  tradable: boolean;
  craftable: boolean;
  priceindex: number;
}

async function makeRequest(endpoint: string, params: MakeRequestParams) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const clonedParams = { ...params, key: BPTF_API_KEY };
    const headers = {
      'X-Auth-Token': BPTF_USER_TOKEN,
    };

    const response = await axios.get(url, { params: clonedParams, headers });

    // Check if the response is null
    if (!response) {
      console.log("API Response is null");
      return null;  // Return null if the response is null
    }

    console.log('API Response:', response);

    if (response.status !== 200) {
      if (response.status === 404) {
        console.log('Resource not found');
      } else if (response.status === 500) {
        console.log('Internal server error');
      } else {
        console.log(`Failed to fetch data: ${response.statusText}`);
      }
    }

    return response.data;

  } catch (error) {
    console.log("An error occurred:", error);
    throw error;  // Re-throw the error if you want it to propagate
  }
}

async function getCurrencies(raw = 2) {
  console.log("Entering getCurrencies");
  const endpoint = 'IGetCurrencies/v1';
  const params = { raw };

  try {
    const data = await makeRequest(endpoint, params);

    if (!data) {
      console.log('Failed to retrieve data');
      return null;
    }

    const response = data.response;
    console.log('getCurrencies: ', response);

    if (!response) {
      console.log('Failed to retrieve currency data');
      return null;
    }

    console.log("Exiting getCurrencies with:", response);
    return response;
  } catch (error) {
    console.log('Error in getCurrencies:', error);
    return null;
  }
}

async function getPriceHistory(params: PriceHistoryParams) {
  console.log('Entering getPriceHistory')
  try {
    const { item, quality, tradable, craftable, priceindex } = params;
    const endpoint = 'IGetPrices/v4';
    const newParams = { item, quality, tradable, craftable, priceindex };

    // Call the makeRequest function to get the data
    const data = await makeRequest(endpoint, newParams);

    // Check if data is null or undefined
    if (!data) {
      console.log('Failed to retrieve price history data');
      return [];  // Return null if data is null
    }

    // Check if data.items is null or undefined
    if (!data.items) {
      console.log('Items property is null or undefined');
      return [];  // Return null if data.items is null
    }

    // Log the items for debugging
    console.log('Retrieved items:', data.items);
    console.log('exiting getPriceHistory')
    return data.items;

  } catch (error) {
    // Log any errors that occur
    console.log('An error occurred while fetching price history:', error);

    // You can choose to re-throw the error if you want it to propagate
    throw error;
  }
}

async function getSpecialItems(appid = 440) {
  const endpoint = 'IGetSpecialItems/v1';
  const params = {appid};
  const data = await makeRequest(endpoint, params);
  if (!data) {
    console.log('Failed to retrieve special items data');
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

async function getPriceSchema(raw = 2, since?: 1999999) {
  const endpoint = 'IGetPrices/v4';
  const params = {raw, since};
  const data = await makeRequest(endpoint, params);
  return data ? data.pricelist : null;
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
    console.log('Failed to retrieve price history for the item');
    return null;
  }
  return data.history;
}

async function getImpersonatedUsers(limit: number, skip: number) {
  const endpoint = 'IGetUsers/GetImpersonatedUsers';
  const params = {limit, skip};
  const data = await makeRequest(endpoint, params);
  if (!data) {
    console.log('Failed to retrieve impersonated users');
    return null;
  }
  return data.results;
}

async function searchClassifiedsV1() {
  const endpoint = 'classifieds/search/v1';
  const data = await makeRequest(endpoint, {});
  if (!data) {
    console.log('Failed to search classifieds');
    return null;
  }
  return data;
}

async function getUserClassifiedListingLimits() {
  const endpoint = 'classifieds/limits';
  const data = await makeRequest(endpoint, {});
  if (!data) {
    console.log('Failed to get user classified listing limits');
    return null;
  }
  return data.listings;
}

async function getNotifications(skip: number, limit: number, unread: number) {
  const endpoint = 'notifications';
  const params = {skip, limit, unread};
  const data = await makeRequest(endpoint, params);
  if (!data) {
    console.log('Failed to get notifications');
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
  getUserListings,
  getPriceHistoryForItem,
  getImpersonatedUsers,
  searchClassifiedsV1,
  getUserClassifiedListingLimits,
  getNotifications
};