/* eslint no-magic-numbers: ['off'] */
/* eslint sort-keys: ['off'] */

import { context, describe, expect, it, story, stub } from '../spec.helpers';

import { Buffer } from 'buffer';
import LedgerDevice from '.';

describe('LedgerDevice', () => {
  describe('#constructor()', () => {
    context('when appId is missing', () => {
      it('should throw an error', () => {
        expect(() => new LedgerDevice({ u2f: {} })).to.throw(Error, /ArgumentError/g);
      });
    });

    context('when u2f is missing', () => {
      it('should throw an error', () => {
        expect(() => new LedgerDevice({ appId: 'APP_ID' })).to.throw(Error, /ArgumentError/g);
      });
    });
  });
});

story('LedgerDevice#sign()', {
  given: () => [
    new Buffer([0xde, 0xad, 0xba, 0xad])
  ],
  when: (inputBuffer) => new LedgerDevice({
    appId: 'https://example.com',
    u2f: {
      sign: stub().callsArgWith(3, {
        signatureData: new Buffer([
          // 5 bytes of filler
          ...new Array(5).fill(0),
          // "v" component
          0xfa,
          // "r" component
          ...new Array(32).fill(0xfa),
          // "s" component
          ...new Array(32).fill(0x1a),
          // Status
          ...[0x90, 0x00]
        ]).toString('base64')
      })
    }
  }).sign(inputBuffer),
  then: async (signature) => expect(await signature).to.deep.equal({
    r: '0xfafafafafafafafafafafafafafafafafafafafafafafafafafafafafafafafa',
    s: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
    v: '0xfa'
  })
});

story('LedgerDevice#getAddress()', {
  given: () => [],
  when: () => new LedgerDevice({
    appId: 'https://example.com',
    u2f: {
      sign: stub().callsArgWith(3, {
        signatureData: new Buffer([
          ...new Array(5).fill(0),
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
    }
  }).getAddress(),
  then: async (address) => expect(await address).to.equal('{Address}')
});
