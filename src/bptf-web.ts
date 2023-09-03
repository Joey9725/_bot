import axios from 'axios';
import { BPTF_API_KEY, BPTF_USER_TOKEN } from './config';
import { Logger } from './logger';

const logger = new Logger('BPTFAPI');
const BASE_URL = 'https://backpack.tf/api/';

interface Params {
  [key: string]: any;
}

interface PriceHistoryParams {
  item: string;
  quality: string;
  tradable: string;
  craftable: string;
  priceindex: string;
}

async function makeRequest(endpoint: string, params: Params) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const clonedParams = { ...params, key: BPTF_API_KEY };

    const headers = {
      'X-Auth-Token': BPTF_USER_TOKEN
    };

    const response = await axios.get(url, { params: clonedParams, headers });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.data;
  } catch (error: any) {
    // Your existing error handling logic here
    return null;
  }
}

async function getCurrencies(raw = 2) {
  const endpoint = 'IGetCurrencies/v1';
  const params = { raw };
  const data = await makeRequest(endpoint, params);
  return data ? data.currencies : null;
}

async function getPriceHistory(params: PriceHistoryParams) {
  const { item, quality, tradable, craftable, priceindex } = params;
  const endpoint = 'IGetPrices/v4';
  const newParams = { item, quality, tradable, craftable, priceindex };
  const data = await makeRequest(endpoint, newParams);
  return data ? data.items : null;
}

async function getSpecialItems(appid = 440) {
  const endpoint = 'IGetSpecialItems/v1';
  const params = { appid };
  const data = await makeRequest(endpoint, params);
  return data ? data.response : null;
}

export {
  getCurrencies,
  getPriceHistory,
  getSpecialItems
};
