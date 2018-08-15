# Ledger `web3` Provider

[![CircleCI](https://circleci.com/gh/blockmason/web3-provider-ledger.svg?style=svg)][12]
[![npm version](https://img.shields.io/npm/v/web3-provider-ledger.svg)][11]
[![npm downloads](https://img.shields.io/npm/dt/web3-provider-ledger.svg)][11]
[![dependencies](https://img.shields.io/david/blockmason/web3-provider-ledger.svg)][10]
[![devDependencies](https://img.shields.io/david/dev/blockmason/web3-provider-ledger.svg)][10]
[![license](https://img.shields.io/github/license/blockmason/web3-provider-ledger.svg)][3]

This web3 provider allows Ethereum transactions to be signed with a [Ledger][4] device.

## Features

 * Lightweight, with minimal dependencies
 * Easy to use; just plug it in wherever a web3 provider is expected

## Installing

**[Yarn][5]:**

```
$ yarn add web3-provider-ledger
```

**[npm][6]:**

```
$ npm install --save web3-provider-ledger
```

## Usage

Let's assume we are using the [`ethjs`][7] library. This library, like Web3,
is designed to be constructed with an instance of a web3 provider.

```javascript
import Eth from 'ethjs';
import LedgerProvider from 'web3-provider-ledger';

const eth = new Eth(new LedgerProvider());
```

That's all you need to do in order to get an instance of ethjs, but
this particular instance is only capable of generating signed transactions.

Here's one way you might end up with a transaction for interacting with
a smart contract:

```javascript
// Use the ethjs contract API to build a convenience wrapper for a contract
const myContract = eth.contract(myContractAbi).at(myContractAddress);

// Get the raw signed transaction
const tx = await myContract.myFunction(...myFunctionArgs);
```

At this point, `tx` gives us a *signed* transaction. We still need to *send*
the transaction, which requires a *network-capable* provider. For this, you
can use the built-in `Eth.HttpProvider` or look for an *injected* provider
via the global `web3.currentProvider`.

Here's what this might look like:

```javascript
// Constract a network-capable instance of ethjs
const ethNet = new Eth(web3.currentProvider);

// Use the network-capable provider to *send* the transaction
const txId = await ethNet.sendRawTransaction(tx);
```

### Usage with `ethjs-signer-provider`

```javascript
import Eth from 'ethjs';
import LedgerDevice from 'web3-provider-ledger/ledger-device';
import SignerProvider from 'ethjs-provider-signer';

const ledgerDevice = new LedgerDevice({ appId: origin, u2f });

const provider = new SignerProvider('https://ropsten.infura.io', {
  signTransaction: async (transaction, callback) => {
    const signedTransaction = await ledgerDevice.signTransaction(transaction);
    callback(null, signedTransaction);
  },
  accounts: async (callback) => {
    const accounts = await ledgerDevice.listAddresses();
    callback(null, accounts);
  }
});

const eth = new Eth(provider);

// `eth` is now configured to use the Ledger device for signing and
// Infura for sending transactions to the Ethereum network
```

### Advanced Usage

See the [API Reference][9] for detailed code-level documentation.

In addition to the provider, this library includes a `LedgerDevice`,
which allows operations to be performed directly on the device. This
can be useful for *account discovery* (`LedgerDevice#listAddresses()`),
which can be used to allow users to choose which account they would like
to use. The index of the preferred account can then be provided to a new
device via the `accountIndex` attribute, and this device can be given to
`LedgerProvider` via its `device` attribute.

For example, here is how you might get a list of account addresses on
the device:

```javascript
import LedgerDevice from 'web3-provider-ledger/device';

const device = new LedgerDevice({ appId: origin, u2f });
const accounts = await device.listAddresses();
```

Let's say the user has selected the account at index `3`. To use that account,
you would then construct the provider as follows:

```javascript
import Eth from 'ethjs';
import LedgerDevice from 'web3-provider-ledger/device';
import LedgerProvider from 'web3-provider-ledger';

// Simple form
const eth = new Eth(new LedgerProvider({ accountIndex: 3 }));

// Advanced form (equivalent result to the simple form above)
const eth = new Eth(new LedgerProvider({
  device: new LedgerDevice({ accountIndex: 3, appId: origin, u2f })
}));
```

## Contributing

See [CONTRIBUTING.md][2].

## Code of Conduct

See [CODE_OF_CONDUCT.md][1].

## Security

See [SECURITY.md][8].

## License

This library is licensed under the [MIT][3] license.

[1]: https://github.com/blockmason/web3-provider-ledger/blob/master/CODE_OF_CONDUCT.md
[2]: https://github.com/blockmason/web3-provider-ledger/blob/master/CONTRIBUTING.md
[3]: https://github.com/blockmason/web3-provider-ledger/blob/master/LICENSE
[4]: https://www.ledgerwallet.com/
[5]: https://npmjs.com/
[6]: https://yarnpkg.com/
[7]: https://github.com/ethjs/ethjs
[8]: https://github.com/blockmason/web3-provider-ledger/blob/master/SECURITY.md
[9]: https://13-115747070-gh.circle-artifacts.com/0/home/project/project/docs/web3-provider-ledger/1.0.6/index.html
[10]: https://github.com/blockmason/web3-provider-ledger/blob/master/package.json
[11]: https://www.npmjs.com/package/web3-provider-ledger
[12]: https://circleci.com/gh/blockmason/web3-provider-ledger
