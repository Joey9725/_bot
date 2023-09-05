import {
    getPriceSchema,
    getCurrencies,
    getSpecialItems,
    getUserListings,
    getUserData,
    searchClassifieds,
    getPriceHistory,
    getPriceHistoryForItem,
    getImpersonatedUsers,
    searchClassifiedsV1,
    getUserClassifiedListingLimits,
    getNotifications
} from './src/bptf-web';

// Mocking axios for testing
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: {}, headers: {}, status: 200 }))
}));

describe('BPTF API', () => {
    it('should fetch currencies', async () => {
        const result = await getCurrencies();
        expect(result).not.toBeNull();
    });

    it('should fetch special items', async () => {
        const result = await getSpecialItems();
        expect(result).not.toBeNull();
    });
    describe('getCurrencies', () => {
        it('fetches successfully data from an API', async () => {
            const data = {
                currencies: {
                    metal: {
                        currency: 'metal',
                        value: 1,
                    },
                },
            };

            (axios.get as jest.Mock).mockResolvedValue({ data });

            const result = await getCurrencies();
            expect(result).toEqual(data.currencies);
        });

        it('fetches erroneously data from an API', async () => {
            const errorMessage = 'An error occurred';

            (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(getCurrencies()).rejects.toThrow(errorMessage);
        });
    });
    // Add more tests for other functions
});
