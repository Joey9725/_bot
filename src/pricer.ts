import {
    registerAgent,
    getAgentStatus,
    searchClassifieds,
} from './bptf-web';
import {
    ListingElement,
    PriceStats,
    ClassifiedSearchResponse,
} from "./interfaces";

const ITEM_NAME = "Tour of Duty Ticket";
const PROFIT_MARGIN = 0;  // Set profit margin

async function main() {
    try {
        await registerAgent();
        await getAgentStatus();
        await fetchKeyPrices();

        const classifieds: ClassifiedSearchResponse = await searchClassifieds(ITEM_NAME, 'buy');

        const sellStats = calculatePriceStats(classifieds.sell?.listings || []);
        const buyStats = calculatePriceStats(classifieds.buy?.listings || []);

        const { sellPrice, buyPrice } = decideBotPrices(sellStats, buyStats);

    } catch (error) {
        console.error(`An error occurred in main(): ${error}`);
    }
}
function filterOutliersByZScore(listings: ListingElement[]): ListingElement[] {
    const prices = listings.map(({ currencies: { metal, keys }}) => metal || (keys || 0) * 50);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const stdDev = Math.sqrt(prices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / prices.length);

    return listings.filter(({ currencies: { metal, keys }}) => {
        const price = metal || (keys || 0) * 50;
        const zScore = (price - mean) / stdDev;
        return Math.abs(zScore) < 2.5;
    });
}

async function fetchKeyPrices() {
    try {
        const classifieds: ClassifiedSearchResponse = await searchClassifieds("Mann Co. Supply Crate Key", 'buy');

        const sellStats = calculatePriceStats(classifieds.sell?.listings || []);
        const buyStats = calculatePriceStats(classifieds.buy?.listings || []);

        console.log(`Current market stats for Mann Co. Supply Crate Key:`);
        console.log(`Sell - Min: ${sellStats.min} metal, Max: ${sellStats.max} metal, Avg: ${sellStats.avg} metal`);
        console.log(`Buy - Min: ${buyStats.min} metal, Max: ${buyStats.max} metal, Avg: ${buyStats.avg} metal`);

    } catch (error) {
        console.error(`An error occurred in fetchKeyPrices(): ${error}`);
    }
}

function calculatePriceStats(listings: ListingElement[]): PriceStats {
    const filteredListings = filterOutliersByZScore(listings);  // or use filterOutliersByIQR(listings)

    let min = Infinity, max = -Infinity, sum = 0;

    for (const { currencies: { metal, keys }} of filteredListings) {
        const priceInMetal = metal || (keys || 0) * 50;
        min = Math.min(min, priceInMetal);
        max = Math.max(max, priceInMetal);
        sum += priceInMetal;
    }

    return {
        min: roundToNearestIncrement(min),
        max: roundToNearestIncrement(max),
        avg: roundToNearestIncrement(sum / (filteredListings.length || 1))
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
