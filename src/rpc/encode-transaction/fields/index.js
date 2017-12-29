/* eslint no-magic-numbers: ["off"] */
/* eslint sort-keys: ["off"] */

import { Buffer } from 'buffer';

const FIELDS = [
  {
    name: 'nonce',
    length: 32,
    allowLess: true,
    default: new Buffer([])
  }, {
    name: 'gasPrice',
    length: 32,
    allowLess: true,
    default: new Buffer([])
  }, {
    name: 'gasLimit',
    alias: 'gas',
    length: 32,
    allowLess: true,
    default: new Buffer([])
  }, {
    name: 'to',
    allowZero: true,
    length: 20,
    default: new Buffer([])
  }, {
    name: 'value',
    length: 32,
    allowLess: true,
    default: new Buffer([])
  }, {
    name: 'data',
    alias: 'input',
    allowZero: true,
    default: new Buffer([])
  }, {
    name: 'v',
    allowZero: true,
    default: new Buffer([0x01])
  }, {
    name: 'r',
    length: 32,
    allowZero: true,
    allowLess: true,
    default: new Buffer([])
  }, {
    name: 's',
    length: 32,
    allowZero: true,
    allowLess: true,
    default: new Buffer([])
  }
];

export default FIELDS;
