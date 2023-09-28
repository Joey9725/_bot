import {
    registerAgent,
    getAgentStatus,
    searchClassifieds,
} from './bptf-web';
import {
    ListingElement,
    PriceStats,
} from "./interfaces";
import {particle_effect_mapping, quality_mapping, spell_mapping, paint_mapping, wear_tier_mapping, killstreaker_mapping, sheen_mapping,killstreak_tier_mapping} from './dict';

const ITEM_NAME = "Strange Rocket Launcher";
const PROFIT_MARGIN = 0;
let globalKeyPrice = 0;  // Initialize to zero or some default value

async function main() {
    try {
        await registerAgent();
        await getAgentStatus();

        const { name: itemName, quality, craftable, priceindex, elevated } = itemNameProcessing(ITEM_NAME);

        globalKeyPrice = await fetchKeyPrices();  // Store key price globally
        const itemStats = await fetchItemStats(itemName, quality, craftable, priceindex, elevated);

        const sellStats = await itemStats.sell;
        const buyStats = await itemStats.buy;

        decideBotPrices(sellStats, buyStats);  // Removed unnecessary awaits

        console.log(`Current market stats for ${ITEM_NAME}`);
        console.log(`Sell - Min: ${sellStats.min} metal, Max: ${sellStats.max} metal, Avg: ${sellStats.avg} metal`);

        console.log(`Buy - Min: ${buyStats.min} metal, Max: ${buyStats.max} metal, Avg: ${buyStats.avg} metal`);

    } catch (error) {
        console.error(`An error occurred in main(): ${error}`);
    }
}

async function fetchItemStats(itemName, quality, craftable, priceindex, elevated) {
    try {
        const classifieds = await searchClassifieds(itemName, 'dual', quality, craftable, priceindex, elevated);

        // Add debugging logs
        console.log(`Data for ${itemName}:`);

        return {
            sell: calculatePriceStats(classifieds.sell?.listings || []),
            buy: calculatePriceStats(classifieds.buy?.listings || [])
        };
    } catch (error) {
        console.error(`An error occurred in fetchItemStats(): ${error}`);
        return {
            sell: null,
            buy: null
        };
    }
}

async function fetchKeyPrices() {
    try {
        const { sell: sellStatsPromise, buy: buyStatsPromise } = await fetchItemStats("Mann Co. Supply Crate Key", 6,1,0,0);

        const sellStats = await sellStatsPromise;
        const buyStats = await buyStatsPromise;

        if (!sellStats || !buyStats) {
            console.error('Sell or Buy stats are null or undefined.');
            return 0;  // Default value, consider what you want here
        }

        console.log(`Current market stats for Mann Co. Supply Crate Key:`);
        console.log(`Sell - Min: ${sellStats.min} metal, Max: ${sellStats.max} metal, Avg: ${sellStats.avg} metal`);
        console.log(`Buy - Min: ${buyStats.min} metal, Max: ${buyStats.max} metal, Avg: ${buyStats.avg} metal`);

        return sellStats.avg;
    } catch (error) {
        console.error(`An error occurred in fetchKeyPrices(): ${error}`);
        return 0;  // Default value, consider what you want here
    }
}

function shouldFilterOut(details: string): boolean {

    const lowerDetails = details.toLowerCase();
    return (
      lowerDetails.includes('spell') ||
      lowerDetails.includes('spells') ||
      lowerDetails.includes('footprints') ||
      lowerDetails.includes('headless') ||
      lowerDetails.includes('voices') ||
      lowerDetails.includes('level 100')
    );
}

function percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = lower + 1;
    const weight = index % 1;

    if (upper >= sorted.length) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function itemNameProcessing(itemName: string): { name: string; quality?: number; craftable?: number; priceindex?: number; elevated?: number } {
    const lowerName = itemName.toLowerCase();
    let quality = 6; // Default to Unique
    let craftable = 1;
    let priceindex = 0;
    let elevated = 0;
    let processedName = itemName;

    if (lowerName.includes('non-craftable')) {
        craftable = -1;
    }

    // Check for Unusual particle effect
    let isUnusual = false;
    for (const effect in particle_effect_mapping) {
        if (lowerName.includes(effect.toLowerCase())) {
            priceindex = particle_effect_mapping[effect];
            isUnusual = true;
            // Remove the particle effect from the item name
            processedName = processedName.replace(new RegExp(effect, "i"), "").trim();
            break;
        }
    }

    // Identify the item's quality or elevated state using quality_mapping
    for (const qualityString in quality_mapping) {
        if (lowerName.includes(qualityString.toLowerCase())) {
            quality = quality_mapping[qualityString];
            break;
        }
    }

    if (isUnusual) {
        if (quality !== 6) {
            elevated = quality;
        }
        quality = 5;  // Setting the quality to Unusual
    }

    // Remove known identifiers from the item name
    processedName = processedName.replace(/(collector's|decorated|genuine|haunted|strange|unique|unusual|vintage|non-craftable)/gi, '').trim();

    const response: { name: string; qualityCode?: number; craftable?: number; priceindex?: number; elevated?: number } = {
        name: processedName,
        qualityCode: quality,
        craftable: craftable,
        priceindex: priceindex
    };

    if (elevated !== 0) {
        response.elevated = elevated;
    }

    console.log(processedName)
    console.log(quality)
    console.log(craftable)
    console.log(priceindex)
    console.log(elevated)

    return response;
}

async function calculatePriceStats(listings: ListingElement[]): Promise<PriceStats> {

    const filteredListings = listings.filter(item => !shouldFilterOut(item.details));

    // Log a slice of the sell listings (e.g., the first 5 listings)
    console.log("Sell Listings (First 5):");
    for (let i = 0; i < Math.min(5, filteredListings.length); i++) {
        const listing = filteredListings[i];

        // Extract prices from the currencies property
        const { metal = 0, keys = 0 } = listing.currencies;
        console.log(`Total Price for listing: ${keys} keys, ${metal} ref`);
    }

    // Corrected Price Calculation
    const prices = filteredListings.map(({ currencies: { metal = 0, keys = 0 }}) => {
        // Multiply the key count by keyPrice for sell listings
        if (keys > 0) {
            const totalPrice = metal + (keys * globalKeyPrice);
            console.log(`Total Price for listing: ${totalPrice} metal`);
            return totalPrice;
        } else {
            console.log(`Total Price for listing: ${metal} metal`);
            return metal;
        }
    });

    // Calculate quartiles without sorting
    const q1 = percentile(prices, 25);
    const q3 = percentile(prices, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Initialize stats variables
    let min = Infinity, max = -Infinity, sum = 0, count = 0;

    // Single loop for filtering and stats calculation
    for (const price of prices) {
        if (price >= lowerBound && price <= upperBound) {
            min = Math.min(min, price);
            max = Math.max(max, price);
            sum += price;
            count++;
        }
    }

    // Calculate average
    const avg = count ? sum / count : 0;

    console.log(`Min Price: ${min} metal`);
    console.log(`Max Price: ${max} metal`);
    console.log(`Sum of Prices: ${sum} metal`);
    console.log(`Number of Listings: ${count}`);
    console.log(`Average Price: ${avg} metal`);

    return {
        min: roundToNearestIncrement(min),
        max: roundToNearestIncrement(max),
        avg: roundToNearestIncrement(avg)
    };
}

export function roundToNearestIncrement(value: number): number {
    return value > 0
      ? Math.floor((Math.round(value * 9) * 100) / 9) / 100
      : Math.ceil((Math.round(value * 9) * 100) / 9) / 100;
}

function decideBotPrices({ avg: sellAvg }: PriceStats, { avg: buyAvg }: PriceStats): { sellPrice: number, buyPrice: number } {
    return {
        sellPrice: sellAvg * (1 + PROFIT_MARGIN / 100),
        buyPrice: buyAvg * (1 - PROFIT_MARGIN / 100)
    };
}

main().catch((err) => {
    console.error(`An error occurred: ${err}`);
});