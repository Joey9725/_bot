module.exports = {
    get: jest.fn(() => Promise.resolve({ data: 'some data' })),
    // other methods
};

axios.request(axiosConfig)
    .then(response => {
        // ... (existing code)
    })
    .catch(error => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized: Invalid API token. Please check your API token.');
            reject('Invalid API token');
        } else if (retry > 0) {
            // ... (existing retry code)
        } else {
            reject(error);
        }
    });
