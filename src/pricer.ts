import {
    getAgentStatus,
    registerAgent,
    getAveragePriceForItem,
} from './bptf-web';

function formatPriceToRef(priceFloat: number): string {
    // Separate the integer and decimal parts
    const integerPart: number = Math.floor(priceFloat);
    const decimalPart: number = priceFloat - integerPart;

    // Map the decimal part to the closest currency unit
    let metalType: string;
    if (decimalPart < 0.16) {
        metalType = "0.11 ref";
    } else if (decimalPart < 0.5) {
        metalType = "0.33 ref";
    } else {
        metalType = "0.99 ref";
    }

    // Combine and return the final price in ref format
    if (integerPart === 0) {
        return metalType;
    } else {
        const metalParts: string[] = metalType.split('.');
        const integerPartMetal: number = parseInt(metalParts[0]);
        const decimalPartMetal: number = parseInt(metalParts[1].slice(0, 2));
        const formattedIntegerPart: number = integerPart + integerPartMetal;
        return `${formattedIntegerPart}.${decimalPartMetal} ref`;
    }
}

async function main() {
    console.log("Inside main");
    const registerResponse = await registerAgent();
    const statusResponse = await getAgentStatus();
    const itemName = 'Mann Co. Supply Crate Key';

    try {
        const { sell, buy } = await getAveragePriceForItem(itemName);
        if (sell && buy) {
            console.log("Agent registered:", registerResponse);
            console.log("Agent status:", statusResponse);
            console.log(`Item: ${itemName}`);
            console.log(`Sell Price: Average ${formatPriceToRef(parseFloat(sell.avg))}, Min ${formatPriceToRef(parseFloat(sell.min))}, Max ${formatPriceToRef(parseFloat(sell.max))}`);
            console.log(`Buy Price: Average ${formatPriceToRef(parseFloat(buy.avg))}, Min ${formatPriceToRef(parseFloat(buy.min))}, Max ${formatPriceToRef(parseFloat(buy.max))}`);
        } else {
            console.log(`No listings found for ${itemName}.`);
        }
    } catch (error) {
        console.error("Error registering agent or fetching status:", error);
        console.error("Error fetching price information:", error);
    }
}


main();
