/* eslint no-magic-numbers: ['off'] */
/* eslint sort-keys: ['off'] */

import { context, describe, expect, it, stub } from './spec.helpers';

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

describe('LedgerProvider', () => {
  const ledgerProvider = new LedgerProvider({ appId: origin, u2f });

  describe('#sendAsync()', () => {
    const sendAsync = (payload, callback) => ledgerProvider.sendAsync(payload, callback);

    context('with a payload for an unsupported JSON RPC version', () => {
      const payload = { jsonrpc: '1.0' };

      it('should trigger the callback only once', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback).to.have.been.calledOnce;
      });

      it('should trigger the callback with an error', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[0]).to.be.an('error');
      });
    });

    context('with a payload for the "eth_accounts" method', () => {
      const payload = {
        id: 'abc123',
        jsonrpc: '2.0',
        method: 'eth_accounts',
        params: []
      };

      it('should trigger the callback only once', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback).to.have.been.calledOnce;
      });

      it('should trigger the callback without an error', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[0]).to.be.undefined;
      });

      it('should trigger the callback with a result of type array', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[1].result).to.be.an('array');
      });

      it('should trigger the callback with a JSON RPC version of 2.0', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[1]).to.have.property('jsonrpc', '2.0');
      });

      it('should trigger the callback with an id mirroring the payload id', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[1]).to.have.property('id', payload.id);
      });
    });

    context('with a payload for the "eth_sendTransaction" method', () => {
      const payload = {
        id: 'abc123',
        jsonrpc: '2.0',
        method: 'eth_sendTransaction',
        params: [
          {}
        ]
      };

      it('should trigger the callback only once', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback).to.have.been.calledOnce;
      });

      it('should trigger the callback without an error', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[0]).to.be.undefined;
      });

      it('should trigger the callback with a JSON RPC version of 2.0', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[1]).to.have.property('jsonrpc', '2.0');
      });

      it('should trigger the callback with an id mirroring the payload id', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[1]).to.have.property('id', payload.id);
      });

      it('should trigger the callback with a result of type string', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[1].result).to.be.a('string');
      });
    });

    context('with a payload for an unsupported JSON RPC method', () => {
      const payload = {
        id: 'abc123',
        jsonrpc: '2.0',
        method: 'eth_hello',
        params: []
      };

      it('should trigger the callback only once', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback).to.have.been.calledOnce;
      });

      it('should trigger the callback with an error', async () => {
        const callback = stub();
        await sendAsync(payload, callback);
        expect(callback.firstCall.args[0]).to.be.an('error');
      });
    });
  });
});
