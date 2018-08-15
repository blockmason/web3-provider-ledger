/* eslint no-magic-numbers: ['off'] */
/* eslint sort-keys: ['off'] */

import { expect, story } from '../../../spec.helpers';

import { Buffer } from 'buffer';

import parseGetAddressResponse from '.';

story('parseGetAddressResponse()', {
  given: () => [
    Buffer.from([
      ...new Array(5).fill(0x1a),
      // Public Key
      [0x12, 0x34, 0x56, 0x78].length,
      ...[0x12, 0x34, 0x56, 0x78],
      // Address
      '{Address}'.length,
      ...Array.from('{Address}').map((c) => c.charCodeAt(0)),
      // Status
      ...[0x90, 0x00]
    ])
  ],
  when: parseGetAddressResponse,
  then: ({ address, header, publicKey }) => {
    expect(header).to.equal('0x1a1a1a1a1a');
    expect(publicKey).to.equal('0x12345678');
    expect(address).to.equal('{Address}');
  }
});
