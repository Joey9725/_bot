# bptf-prices
A Node.js wrapper for the Backpack.tf economy Web API.

[![npm version](https://img.shields.io/npm/v/bptf-prices.svg?style=flat-square)](https://npmjs.com/package/bptf-prices)
[![node version](https://img.shields.io/node/v/bptf-prices?style=flat-square)](https://nodejs.org/en/about/releases/)
[![npm test](https://img.shields.io/github/actions/workflow/status/SnaBe/node-bptf-prices/test.yml?logo=github&branch=main&style=flat-square)](https://github.com/SnaBe/node-bptf-prices/actions/workflows/test.yml)
[![dependencies](https://img.shields.io/librariesio/release/npm/bptf-prices?style=flat-square)](https://www.npmjs.com/package/bptf-prices)
[![npm downloads](https://img.shields.io/npm/dm/bptf-prices.svg?style=flat-square)](https://npmjs.com/package/bptf-prices)
[![license](https://img.shields.io/npm/l/bptf-prices.svg?style=flat-square)](https://github.com/SnaBe/node-bptf-prices/blob/master/LICENSE)
[![paypal](https://img.shields.io/badge/paypal-donate-yellow.svg?style=flat-square)](https://www.paypal.me/snabe)

## Installation

Using [npm](https://www.npmjs.com/package/bptf-prices):

```bash
$ npm install bptf-prices
```

Using [yarn](https://yarnpkg.com/package/bptf-prices):

```bash
$ yarn add bptf-prices
```

## Testing

**Note**: Make sure you've supplied a valid `API key` in the [test.js](https://github.com/SnaBe/node-bptf-prices/blob/main/test/test.js) file.

Using [npm](https://docs.npmjs.com/cli/v8/commands/npm-run-script):
```bash
$ npm test
```

Using [yarn](https://classic.yarnpkg.com/lang/en/docs/cli/run/):
```bash
$ yarn test
```

## Examples

### Importing with `CommonJS`

```js
const bptfprices = require('bptf-prices');
```

### or with `ES6's import` statement

```js
import bptfprices from 'bptf-prices';
```

### Instantiating with the `apiKey` option
```js
const bptf = new bptfprices({ apiKey: 'XXXXXXXXXXXXXXXXXXXXXXXX' });
```

### Asynchronous requests with `callbacks`

```js
bptf.getSpecialItems({
    appid: 440,
    callback: (err, specials) => {
        if (err) throw err;

        console.log(specials.items);
    }
});
```

### Asynchronous requests with `async`/`await`

```js
(async () => {
    try {
        const data = await bptf.getCurrencies({ 
            raw: 2 
        });

        console.log(data.currencies);
    } catch (error) {
        console.error('An error occurred: ', error);
    }
})();
```

There are some more examples available in the [test](https://github.com/SnaBe/node-bptf-prices/tree/main/test) directory.

## Documentation

See the [Wiki pages](https://github.com/SnaBe/node-bptf-prices/wiki) for further documentation.

## License

[MIT](LICENSE)

Copyright 2023, Simon Sørensen
