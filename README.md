# Ledger `web3` Provider

This web3 provider allows Ethereum transactions to be signed with a Ledger device.

## Installing

**Yarn:**

```
$ yarn add web3-provider-ledger
```

**npm:**

```
$ npm install --save web3-provider-ledger
```

## Usage

Let's assume we are using the `ethjs` library. This library, like Web3,
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
