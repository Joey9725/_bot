import { getPriceSchema } from './bptf-web'; // Adjust the import path as needed

const fetchInterval = 1000; // 1 second in milliseconds (adhering to the 1 request per second limit)

async function fetchPrices() {
    try {
        const priceSchema = await getPriceSchema(2, 1999999);
        // Update your local price database with 'priceSchema'
        console.log('Prices updated successfully.');
    } catch (error) {
        if (error.response && error.response.status === 429) {
            // Rate limit exceeded, retry after the specified interval
            console.log('Rate limit exceeded. Retrying in 1 second.');
            setTimeout(fetchPrices, fetchInterval);
        } else {
            console.error('Error fetching prices:', error);
        }
    }
}

// Start fetching
fetchPrices();
