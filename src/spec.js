/* eslint no-magic-numbers: ['off'] */
/* eslint sort-keys: ['off'] */

import { context, describe, expect, it, stub } from './spec.helpers';

import { Buffer } from 'buffer';
import LedgerDevice from './device';
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

describe('LedgerProvider', () => {
  const ledgerProvider = new LedgerProvider({
    device: new LedgerDevice({ appId: origin, u2f })
  });

  describe('#sendAsync()', () => {
    const sendAsync = (payload, callback) => ledgerProvider.sendAsync(payload, callback);

    const withPayload = (description, payload, spec) => {
      const expectCallback = (description, spec) => {
        it(`should trigger the callback ${description}`, async () => {
          const callback = stub();
          await sendAsync(payload, callback);
          spec(callback);
        });
      };

      context(`with a payload ${description}`, () => {
        spec({ expectCallback, payload });
      });
    };

    withPayload('for an unsupported JSON RPC version', {
      jsonrpc: '1.0'
    }, ({ expectCallback }) => {
      expectCallback('only once', (callback) => expect(callback).to.have.been.calledOnce);
      expectCallback('with an error', (callback) => expect(callback.firstCall.args[0]).to.be.an('error'));
    });

    withPayload('for an unsupported JSON RPC method', {
      id: 'abc123',
      jsonrpc: '2.0',
      method: 'eth_hello',
      params: []
    }, ({ expectCallback }) => {
      expectCallback('only once', (callback) => expect(callback).to.have.been.calledOnce);
      expectCallback('with an error', (callback) => expect(callback.firstCall.args[0]).to.be.an('error'));
    });

    withPayload('for the "eth_accounts" method', {
      id: 'abc123',
      jsonrpc: '2.0',
      method: 'eth_accounts',
      params: []
    }, ({ expectCallback, payload }) => {
      expectCallback('only once', (callback) => expect(callback).to.have.been.calledOnce);
      expectCallback('without an error', (callback) => expect(callback.firstCall.args[0]).to.be.undefined);
      expectCallback('with a JSON RPC version of 2.0', (callback) => expect(callback.firstCall.args[1]).to.have.property('jsonrpc', '2.0'));
      expectCallback('with an id mirroring the payload id', (callback) => expect(callback.firstCall.args[1]).to.have.property('id', payload.id));
      expectCallback('with a result of type array', (callback) => expect(callback.firstCall.args[1].result).to.be.an('array'));
    });

    withPayload('for the "eth_sendTransaction" method', {
      id: 'abc123',
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {}
      ]
    }, ({ expectCallback, payload }) => {
      expectCallback('only once', (callback) => expect(callback).to.have.been.calledOnce);
      expectCallback('without an error', (callback) => expect(callback.firstCall.args[0]).to.be.undefined);
      expectCallback('with a JSON RPC version of 2.0', (callback) => expect(callback.firstCall.args[1]).to.have.property('jsonrpc', '2.0'));
      expectCallback('with an id mirroring the payload id', (callback) => expect(callback.firstCall.args[1]).to.have.property('id', payload.id));
      expectCallback('with a result of type string', (callback) => expect(callback.firstCall.args[1].result).to.be.a('string'));
    });
  });
});
