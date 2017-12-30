# Ledger `web3` Provider

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
