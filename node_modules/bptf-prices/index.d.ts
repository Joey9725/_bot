/** Constructor options for the EconomyWrapper class. */
export interface EconomyOptions {
    apiKey?: string | null // A Backpack.tf API key
}

/** Backpack.tf price object for the GetCurrenciesResponse object. */
export interface ItemPrice {
    value: number, // The item's price on Backpack.tf
    currency: string, // The currency used by Backpack.tf
    difference: number, // The difference in price
    last_update: number, // Date for last price update
    value_high: number, // The all-time high item price
    value_raw: number, // The item's raw price
    value_high_raw: number // The all-time high raw item price
}

/** A string that represents an item's name and or title prefix. */
export type ItemQuality = 'Normal' | 'Unique' | 'Strange' 
| 'Vintage' | 'Genuine' | 'Unusual' 
| 'Haunted' | 'Collector\'s' | 'Decorated' 
| 'Community' | 'Self-Made' | 'Valve'

/** Backpack.tf currency object for the GetCurrenciesResponse object. */
export interface ItemCurrency {
    name: string, // The name of the item
    quality: ItemQuality, // The item's in-game quality
    priceindex: string, // Price index for the item
    single: string, // The name for a singular item
    plural: string, // The name for a stack of the item
    round: number, // Number to round the item's price
    blanket: number, // The blanket value for the item
    craftable: 'Craftable' | 'Non-Craftable', // If the item is craftable
    tradable: 'Tradable' | 'Non-Tradable', // If the item is tradable
    defindex: number, // The item's index number
    price: ItemPrice // The item's price object
}

/** Response object for the getCurrencies method. */
export interface GetCurrenciesResponse {
    success: 0 | 1, // If the request was a success
    currencies: { // An object of Team Fortress 2 currencies
        metal: ItemCurrency // Currency object for Refined Metal
        hat: ItemCurrency, // Currency object for Craft Hats
        keys: ItemCurrency, // Currency object for Mann Co. Keys
        earbuds: ItemCurrency // Currency object for Earbuds
    },
    name: string, // The name of the game acosaited with the currency
    url: string // A link to Backpack.tf
}

/** Parameter options for the getCurrencies method. */
export interface GetCurrenciesParameters {
    raw?: number, // Include raw price values for currencies
    callback?: (error: Error | null, response: GetCurrenciesResponse | null) => void // Callback function
}

/** Backpack.tf price history price object for the GetPriceHistoryResponse object. */
export interface PriceHistory {
    value: number, // The price for the item
    value_high: number, // The all-time high price for the item
    currency: string, // The item currency
    timestamp: number // The last time the price was updated
}

/** Response object for the getPriceHistory method. */
export interface GetPriceHistoryResponse {
    success: 0 | 1, // If the request was a success
    history: Array<PriceHistory> // The item's price history stored as a nested array
}

/** Parameter options for the getPriceHistory method. */
export interface GetPriceHistoryParameters {
    appid?: 440, // Team Fortress 2 application id
    item?: string, // The item's standardized name
    quality?: ItemQuality, // The item's in-game quality
    tradable?: 'Tradable' | 'Non-Tradable', // If the item is tradable
    craftable?: 'Craftable' | 'Non-Craftable', // If the item is craftable
    priceindex?: string, // Price index for the item
    callback?: (error: Error | null, response: GetPriceHistoryResponse | null) => void // Callback function
}

/** Backpack.tf price object for the GetPricesResponse object. */
export interface TradablePrice {
    value: number, // The item's price on Backpack.tf
    currency: string, // The currency used by Backpack.tf
    difference: number, // The difference in price
    last_update: number, // Date for last price update
    value_high?: number, // The all-time high item price
    value_raw: number, // The item's raw price
}

/** Response object for the getPrices method. */
export interface GetPricesResponse {
    success: 0 | 1, // If the request was a success
    current_time: number, // The current Unix time
    raw_usd_value: number, // The USD value of the currency 
    usd_currency: string, // The currency for the item prices
    usd_currency_index: number, // Currency index for USD
    items: { // An object with Backpack.tf items and prices
        [name: string]: { // Index the items by their name
            defindex: Array<number>, // The item's defindex
            prices: { // The item's price object 
                [quality: string]: { // The item's in-game quality
                    Tradable: { // If the item is tradable
                        Craftable?: Array<TradablePrice> | { // If the item is also craftable
                            [id: string]: TradablePrice // Unusual effect id for the Craftable item
                        },
                        'Non-Craftable'?: Array<TradablePrice> | { // // If the item is also non-craftable
                            [id: string]: TradablePrice // Unusual effect id for the Non-Craftable item
                        }
                    }
                }
            }
        }
    }
}

/** Parameter options for the getPrices method. */
export interface GetPricesParameters {
    raw?: number, // Include raw price values for currencies
    since?: number, // Price updates since this Unix time
    callback?: (error: Error | null, response: GetPricesResponse | null) => void // Callback function
}

/** Backpack.tf special item object for the GetSpecialItemsResponse object. */
export interface SpecialItem {
    name: string, // The name of the item
    item_name: string // The item's display name
    defindex: number, // The item's defindex
    item_class: string, // The item's class type
    item_type_name: string, // The item's type name
    item_description: string, // The item's description
    item_quality: number, // The item's in-game quality
    min_ilevel: number, // Minimum item level
    max_ilevel: number, // Maximum item level
    image_url: string, // Link to an image on Steam
    image_url_large: string, // Link to a larger image on Steam
    appid: number // // Team Fortress 2 application id
}

/** Response object for the getPrices method. */
export interface GetSpecialItemsResponse {
    success: 0 | 1, // If the request was a success
    current_time: number, // The current Unix time
    items: Array<SpecialItem> // An Array of Special TF2 items
}

/** Parameter options for the getSpecialItems method. */
export interface GetSpecialItemsParameters {
    appid?: 440, // Team Fortress 2 application id
    callback?: (error: Error | null, response: GetSpecialItemsResponse | null) => void // Callback function
}

// Export the EconomyWrapper class as default
export default EconomyWrapper;
/**
 * Wrapper class for the Backpack.tf economy Web API.
 */
declare class EconomyWrapper {
    /**
     * Constructs a new bptf-prices instance.
     * @param { EconomyOptions } options An object containing valid constructor options.
     * @param { string } options.apiKey A Backpack.tf developer API key.
     */
    constructor({ apiKey }?: EconomyOptions);
    /**
     * Get currency data for Team Fortress 2.
     * @param { GetCurrenciesParameters } params An object of valid arguments for the IGetCurrencies/v1 endpoint.
     * @param { number } params.raw If set, modifies the raw value for the price index objects by allowing or preventing averaging behavior.
     * @param { void } [params.callback] Optional, called when a response is available. If omitted the function returns a promise.
     * @returns { Promise<GetCurrenciesResponse> | void } An object with Backpack.tf's internal currency data for Team Fortress 2.
     */
    getCurrencies({ raw, callback }?: GetCurrenciesParameters): Promise<GetCurrenciesResponse> | void;
    /**
     * Gets the price history for an item that corresponds to the parameters. If none, returns the price history for The Team Captain.
     * @param { GetPriceHistoryParameters } params An object of valid arguments for the v1 IGetPriceHistory endpoint. All are "optional" and have default values.
     * @param { number } params.appid The appid of the item, defaults to 440 (Team Fortress 2).
     * @param { string } params.item The item's base name, defaults to Team Captain.
     * @param { string } params.quality The item's quality property, defaults to Unique.
     * @param { number } params.tradable The item's tradeable state, defaults to Tradable.
     * @param { number } params.craftable The item's craftable state, defaults to Craftable.
     * @param { number } params.priceindex The item's price index as a number.
     * @param { void } [params.callback] Optional, called when a response is available. If omitted the function returns a promise.
     * @returns { Promise<GetPriceHistoryResponse> | void } An object with the price history that correspond to the `item` parameter.
     */
    getPriceHistory({ appid, item, quality, tradable, craftable, priceindex, callback }?: GetPriceHistoryParameters): Promise<GetPriceHistoryResponse> | void;
    /**
     * Gets the price schema. Won't work for games that aren't TF2, with the response being cached globally for 900 seconds.
     * @param { GetPricesParameters } params An object of valid arguments for the IGetSpecialItems endpoint. All are optional and have default values.
     * @param { number } params.raw If set, modifies the raw value for the price index objects by allowing or preventing averaging behavior.
     * @param { number } params.since If set, only returns prices that have a last_update value greater than or equal to this Unix time.
     * @param { void } [params.callback] Optional, called when a response is available. If omitted the function returns a promise.
     * @returns { Promise<GetPricesResponse> | void } An object with the Team Fortress 2 price schema.
     */
    getPrices({ raw, since, callback }?: GetPricesParameters): Promise<GetPricesResponse> | void;
    /**
     * Get Backpack.tf's internal item placeholders that correspond to the `appid` parameter.
     * @param { GetSpecialItemsParameters } params An object of valid arguments for the IGetPrices endpoint.
     * @param { number } params.appid The appid of the item, defaults to 440 (Team Fortress 2).
     * @param { void } [params.callback] Optional, called when a response is available. If omitted the function returns a promise.
     * @returns { Promise<GetSpecialItemsResponse> | void } An object with Backpack.tf's internal item placeholders that correspond to the `appid` parameter.
    */
    getSpecialItems({ appid, callback }?: GetSpecialItemsParameters): Promise<GetSpecialItemsResponse> | void;

    // Type declaration for private properties
    #private;
}
