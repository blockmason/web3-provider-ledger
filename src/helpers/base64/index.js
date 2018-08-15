import { Buffer } from 'buffer';

const Base64 = {
  fromBase64: (input) => Buffer.from(input, 'base64'),
  // eslint-disable-next-line no-magic-numbers
  fromBase64URLSafe: (input) => Buffer.from(`${input.replace(/-/g, '+').replace(/_/g, '/')}${'=='.substring(0, 3 * input.length % 4)}`, 'base64'),
  toBase64: (input) => input.toString('base64'),
  // eslint-disable-next-line no-div-regex
  toBase64URLSafe: (input) => input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
};

export default Base64;
