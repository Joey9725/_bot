import {getPriceSchema, getPriceFromSchemaFile, getClassifiedListings} from './bptf-web';

async function main() {
    console.log("Inside main");

    const itemName = 'Mann Co. Supply Crate Key';
    const schema = await getPriceSchema();

    //console.log("Schema Data:", schema); // Debug

    const priceData = getPriceFromSchemaFile(itemName);
    if (priceData) {
        //console.log("All keys in schema:", Object.keys(priceData));
        //console.log(`Price data for ${itemName}:`, JSON.stringify(priceData, null, 2));
        //console.log("Detailed prices for Craftable and Tradable:", priceData['6'].Tradable.Craftable);
    } else {
        //console.log(`${itemName} not found in the price schema.`);
    }

    const classifiedData = await getClassifiedListings();
    if (classifiedData) {
        console.log(`Classified listings data:`, classifiedData);
        // Extract and compare prices here
    } else {
        console.log(`No data found in the classified listings.`);
    }
}

main();