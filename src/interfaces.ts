
export interface PriceStats {
  min: number;
  max: number;
  avg: number;
}

export interface Item {
  name: string;
  quality: number;
}

export interface Currency {
  metal?: number;
  keys?: number;
}

export interface ListingElement {
  id: string;
  steamid: string;
  item: Item;
  currencies: Currency;
  intent: number;
}

export interface IntentListings {
  total: number;
  listings: ListingElement[];
}

export interface ClassifiedSearchResponse {
  success: boolean;
  message?: string;
  buy?: IntentListings;
  sell?: IntentListings;
}

export interface ClassifiedListing {
  item_name: string;
  price: number;
  quality: string;
  tradable: boolean;
  craftable: boolean;
}

export interface CacheData {
  data: any; // You can make this more specific depending on your needs
  expireTime: number;
}

export interface ResponseData {
  response?: any;
  items?: any;
  listings?: any;
  history?: any;
  results?: any;
  users?: any;
}

export interface PriceHistoryParams {
  item: string;
  quality: number;
  tradable: string;
  craftable: string;
  priceindex: number;
}

export interface PriceHistoryData {
  history: { value: string }[];
}

export interface RawCurrencyData {
  name: string;
  quality: string;
  priceindex: string;
  single: string;
  plural: string;
  round: number;
  craftable: string;
  defindex: number;
  active: number;
  price: {
    currency: string;
    value: number;
    value_high: number;
    value_raw: number;
    value_raw_high: number;
    last_update: number;
    difference: number;
    australium: number;

  };
  historical?: {
    value: number;
    timestamp: number;
  }[];
}
