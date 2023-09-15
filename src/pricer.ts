import {getPriceSchema, getPriceFromSchemaFile} from './bptf-web';


function main() {
    console.log("Inside main");


    const itemName = 'Mann Co. Supply Crate Key';
    const priceData = getPriceFromSchemaFile(itemName);
    getPriceSchema();
    console.log("All keys in schema:", Object.keys(getPriceFromSchemaFile));
    if (priceData) {
        console.log(`Price data for ${itemName}:`, priceData);
    } else {
        console.log(`${itemName} not found in the price schema.`);
    }

}

main();
