/* eslint no-magic-numbers: ['off'] */
/* eslint sort-keys: ['off'] */

import { expect, story, stub } from './spec.helpers';

import { Buffer } from 'buffer';
import LedgerProvider from '.';

const origin = 'https://example.com';
const u2f = {
  sign: stub().callsArgWith(3, {
    signatureData: new Buffer([
      ...new Array(5).fill(0x1a),
      // Public Key
      [0x12, 0x34, 0x56, 0x78].length,
      ...[0x12, 0x34, 0x56, 0x78],
      // Address
      '{Address}'.length,
      ...Array.from('{Address}').map((c) => c.charCodeAt(0)),
      // Status
      ...[0x90, 0x00]
    ]).toString('base64')
  })
};

const ledgerProvider = new LedgerProvider({ appId: origin, u2f });

const callback = stub();

story('LedgerProvider#sendAsync() with a payload for an unsupported JSON RPC version should trigger the callback with an error', {
  given: () => [{ jsonrpc: '1.0' }, callback],
  when: (payload, callback) => ledgerProvider.sendAsync(payload, callback),
  then: async (returnValue) => {
    await returnValue;
    expect(callback.firstCall.args[0]).to.be.an('error');
  }
});

story('LedgerProvider#sendAsync() with a payload for the "eth_accounts" method should trigger the callback with a result of type array', {
  given: () => {
    callback.reset();
    return [
      {
        id: 'abc123',
        jsonrpc: '2.0',
        method: 'eth_accounts',
        params: [
          {}
        ]
      },
      callback
    ];
  },
  when: (payload, callback) => ledgerProvider.sendAsync(payload, callback),
  then: async (returnValue) => {
    await returnValue;
    expect(callback.firstCall.args[0]).to.be.undefined;
    expect(callback.firstCall.args[1]).to.have.property('id', 'abc123');
    expect(callback.firstCall.args[1]).to.have.property('jsonrpc', '2.0');
    expect(callback.firstCall.args[1].result).to.be.an('array');
  }
});

story('LedgerProvider#sendAsync() with a payload for the "eth_sendTransaction" method should trigger the callback with a result of type string', {
  given: () => {
    callback.reset();
    return [
      {
        id: 'abc123',
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        params: [
          {}
        ]
      },
      callback
    ];
  },
  when: (payload, callback) => ledgerProvider.sendAsync(payload, callback),
  then: async (returnValue) => {
    await returnValue;
    expect(callback.firstCall.args[0]).to.be.undefined;
    expect(callback.firstCall.args[1]).to.have.property('id', 'abc123');
    expect(callback.firstCall.args[1]).to.have.property('jsonrpc', '2.0');
    expect(callback.firstCall.args[1].result).to.be.a('string');
  }
});

story('LedgerProvider#sendAsync() with a payload for an unsupported JSON RPC method should trigger the callback with an error', {
  given: () => {
    callback.reset();
    return [
      {
        id: 'abc123',
        jsonrpc: '2.0',
        method: 'eth_hello',
        params: []
      },
      callback
    ];
  },
  when: (payload, callback) => ledgerProvider.sendAsync(payload, callback),
  then: async (returnValue) => {
    await returnValue;
    expect(callback.firstCall.args[0]).to.be.an('error');
  }
});
