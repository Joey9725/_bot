module.exports = {
    get: jest.fn(() => Promise.resolve({ data: 'some data' })),
    // other methods
};
