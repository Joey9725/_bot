import {
    getAgentStatus,
    getPriceFromSchemaFile,
    registerAgent,
    getAveragePriceForItem, // Import the getAveragePriceForItem function
} from './bptf-web';

interface ClassifiedListing {
    item_name: string;
    price: number;
    // Add other properties that you expect here
}

const registerResponse = registerAgent();
console.log("Agent registered:", registerResponse);

const statusResponse = getAgentStatus();
console.log("Agent status:", statusResponse);

async function main() {
    console.log("Inside main");

    const itemName = 'Mann Co. Supply Crate Key'; // Replace with the item name you want to calculate the price for
    const { sell, buy } = await getAveragePriceForItem(itemName);

    console.log(`Item: ${itemName}`);
    console.log(`Average Sell Price: ${sell !== null ? sell.toFixed(2) : 'N/A'}`);
    console.log(`Average Buy Price: ${buy !== null ? buy.toFixed(2) : 'N/A'}`);
}

main();
