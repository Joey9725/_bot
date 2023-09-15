/*import axios from 'axios';
import {
    cache,
    getCurrencies,
    getPriceHistory,
    getSpecialItems,
    getUserData,
    getUserListings,
    getPriceHistoryForItem,
    getImpersonatedUsers,
    searchClassifiedsV1,
    getUserClassifiedListingLimits,
    getNotifications
} from '../src/bptf-web';
import { BPTF_USER_TOKEN, BPTF_API_KEY } from '../src/config';

// Mock the entire Axios module
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const commonHeaders = {
    'X-Auth-Token': BPTF_USER_TOKEN,
};

describe('BPTF Web API', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        cache.clear();
        jest.resetAllMocks();
    });

    it('should call getCurrencies and return a response', async () => {
        // Mock the get method to return a specific value
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { response: { currencies: { metal: { name: 'Refined Metal' } } } },
        });

        const response = await getCurrencies();
        expect(response).not.toBeNull();
        expect(response).toEqual({ currencies: {metal: {name: 'Refined Metal'}}});
    });

    it('should return price history when makeRequest returns data', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { items: [{ price: 10 }, { price: 20 } ] },
        });

        const params = {
            item: 'Tour of Duty Ticket',
            quality: 'normal',
            tradable: true,
            craftable: true,
            priceindex: 0,
        };

        const result = await getPriceHistory(params);
        expect(result).toEqual([ { price: 10 }, { price: 20 } ]);
    });

    it('should return special items data when API returns valid data', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { response: {success: {current_time:{items: {name: "Random Craft Hat"} } } } },
        });

        const result = await getSpecialItems(440);
        expect(result).toEqual({success: {current_time:{items: {name: "Random Craft Hat"} } } });
    });

    it('should return user data when API returns valid data', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { users: [{ id: '123', name: 'John Doe' }] },
        });

        const steamid = '123';
        const result = await getUserData(steamid);
        expect(result).toEqual({ id: '123', name: 'John Doe' });
    });

    it('should return price schema when API returns valid data', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { pricelist: [{ item: 'Refined Metal', price: 1 }] },
        });

        const result = await getPriceSchema();
        expect(result).toEqual([{ item: 'Refined Metal', price: 1 }]);
    });

    it('should return user listings when getUserListings is called', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { listings: [{ item: 'Key', price: 50 }] },
        });

        const result = await getUserListings('someSteamId');
        expect(result).toEqual([{ item: 'Key', price: 50 }]);
    });

    it('should return price history for an item when getPriceHistoryForItem is called', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { history: [{ price: 10 }, { price: 20 }] },
        });

        const result = await getPriceHistoryForItem('440', 'Tour of Duty Ticket', 'normal', 'true', 'true', '0');
        expect(result).toEqual([{ price: 10 }, { price: 20 }]);
    });

    it('should return impersonated users when getImpersonatedUsers is called', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { results: ['user1', 'user2'] },
        });

        const result = await getImpersonatedUsers(10, 0);
        expect(result).toEqual(['user1', 'user2']);
    });

    it('should return data when searchClassifiedsV1 is called', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { someData: 'value' },
        });

        const result = await searchClassifiedsV1();
        expect(result).toEqual({ someData: 'value' });
    });

    it('should return user classified listing limits when getUserClassifiedListingLimits is called', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { listings: { max: 10, current: 5 } },
        });

        const result = await getUserClassifiedListingLimits();
        expect(result).toEqual({ max: 10, current: 5 });
    });

    it('should return notifications when getNotifications is called', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { notifications: [{ id: 1, message: 'Test' }] },
        });

        const result = await getNotifications(0, 10, 1);
        expect(result).toEqual({ notifications: [{ id: 1, message: 'Test' }] });
    });

    it('should return null when API returns null', async () => {
        jest.mock('axios', () => ({
            get: jest.fn(() => Promise.resolve(null))
        }));

        const result1 = await getSpecialItems(440);
        const result2 = await getUserData('123');
        const result3 = await getPriceSchema();

        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(result3).toBeNull();
    });
});
*/