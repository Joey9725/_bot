// Mocha and Chai are used for unit testing
const expect = require('chai').expect

// Replace this with const bptfprices = require('bptf-prices'); if used outside of the module directory
const bptfprices = require('../index')

// Use a global instance for testing 
const bptf = new bptfprices({ apiKey: process.env.API_KEY })

// The unit tests
describe('bptf-prices tests', () => {
    // Test and verify that the target is an instance of the given constructor
    describe('instance of constructor', () => {
        // Instance should match class
        it('should be instance of bptf-prices', () => {
            // Expect that the target is an instance of the given constructor
            expect(bptf).to.be.an.instanceof(bptfprices)
        })
    })

    // Get currency data for Team Fortress 2
    describe('getCurrencies', () => {
        // The function should return an object with Team Fortress 2 currency data
        it('should return currency data from Team Fortress 2', (done) => {
            // Get currency data for Team Fortress 2
            bptf.getCurrencies({ raw: 2, callback: (err, data) => {
                // Error getting currency data
                if (err) return done(err)

                // The response should have status code 200 (ok),
                // it should also be an object
                // and must have a property named currencies
                // The currencies property should have a property named earbuds
                expect(data).to.be.an('object')
                expect(data).to.have.property('currencies')
                expect(data.currencies).to.have.property('earbuds')

                // Call done to end the test when the callback is invoked
                done()
            }})
        })
    })

    // Gets the price history for a Team Fortress 2 item
    describe('getPriceHistory', () => {
        // The function should return an array containing price history data for a Strange Antarctic Eyewear
        it('should return the price history of an item', (done) => {
            // Get the price history for a Strange Antarctic Eyewear
            bptf.getPriceHistory({ item: 'Antarctic Eyewear', quality: 'Strange', tradable: 'Tradable', callback: (err, item) => {
                // Error getting the item's price history
                if (err) return done(err)

                // The response should have status code 200 (ok),
                // it should also be an object
                // and must have a property named history
                // The history property should be an array with any given length
                expect(item).to.be.an('object')
                expect(item).to.have.property('history')
                expect(item.history).to.be.an('array')

                // Call done to end the test when the callback is invoked
                done()
            }})
        })
    })

    // Gets the Team Fortress 2 price schema
    describe('getPrices', () => {
        // The function should return an object of Team Fortress 2 price data
        it('should return price data from Team Fortress 2', (done) => {
            // Get all the price data from Backpack.tf since a given Unix time
            bptf.getPrices({ raw: 1, since: 1611752400, callback: (err, prices) => {
                // Error getting prices
                if (err) return done(err)

                // The response should have status code 200 (ok),
                // it should also be an object
                // and must have a property named items
                expect(prices).to.be.an('object')
                expect(prices).to.have.property('items')

                // Call done to end the test when the callback is invoked
                done()
            }})
        })
    })

    // Get Backpack.tf's internal item placeholders
    describe('getSpecialItems', () => {
        // The function should return an object of Team Fortress 2 currency data
        it('should return Backpack.tf\'s item placeholders from Team Fortress 2', (done) => {
            // Get Backpack.tf's special items for Team Fortress 2
            bptf.getSpecialItems({ appid: 440, callback: (err, specials) => {
                // Error getting Backpack.tf's special items
                if (err) return done(err)

                // The response should have status code 200 (ok),
                // it should also be an object
                // and must have a property named items
                // The items property should be an array with a length of 1
                expect(specials).to.be.an('object')
                expect(specials).to.have.property('items')
                expect(specials.items).to.be.an('array')
                expect(specials.items).to.have.length(1)

                // Call done to end the test when the callback is invoked
                done()
            }})
        })
    })
})
