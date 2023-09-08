import axios, { AxiosResponse } from 'axios';
import {
    getCurrencies,
    getPriceHistory,
    getSpecialItems,
} from '../src/bptf-web';
import { BPTF_API_KEY, BPTF_USER_TOKEN } from '../src/config';

jest.mock('axios');

const commonHeaders = {
    'X-Auth-Token': BPTF_USER_TOKEN,
};

const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get = jest.fn();

describe('BPTF Web API', () => {
    afterEach(() => {
        mockedAxios.get.mockClear();
        // Clear other HTTP methods if needed
    });

    it('should call getCurrencies and return a response', async () => {
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: { response: { currencies: { metal: { name: 'Refined Metal' } } } },
            headers: { 'x-rate-limit-reset': '60' },
        } as unknown as AxiosResponse);

        const response = await getCurrencies();

        expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://backpack.tf/api/IGetCurrencies/v1',
            {
                params: { key: BPTF_API_KEY, raw: 2 },
                headers: commonHeaders,
            }
        );

        expect(response).toEqual({ metal: { name: 'Refined Metal' } });
    });

    // ... (rest of the test cases)
});