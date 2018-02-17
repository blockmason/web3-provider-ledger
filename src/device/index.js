/* eslint no-magic-numbers: ['off'] */

import Base64 from '../helpers/base64';
import { Buffer } from 'buffer';
import createGetAddressRequest from './get-address/request';
import createSignRequest from './sign/request';
import parseGetAddressResponse from './get-address/response';
import parseSignResponse from './sign/response';

const U2FSignError = [
  () => new Error('OK: The operation completed successfully.'),
  () => new Error('Unknown Error: An unknown error occurred.'),
  () => new Error('Bad Request: The request could not be processed.'),
  () => new Error('Unsupported Configuration: The client configuration is not supported.'),
  () => new Error('Ineligible Device: The presented device is not eligible for this request. The token may not know the presented key handle.'),
  () => new Error('Timeout: The timeout was reached before the request could be satisfied.')
];

U2FSignError.from = (errorCode) => U2FSignError[errorCode]();

const LEDGER_STATUS_OK = 0x9000;
const LEDGER_STATUS_LOCKED = 0x6801;
const LEDGER_STATUS_CANCELLED = 0x6985;

const assertStatus = (signature) => {
  const status = signature.readUInt16BE(signature.length - 2);

  switch (status) {
    case LEDGER_STATUS_LOCKED:
      throw new Error('DeviceLocked: Unlock your Ledger device and try again.');
    case LEDGER_STATUS_CANCELLED:
      throw new Error('Cancelled: The operation was cancelled via the Ledger device.');
    case LEDGER_STATUS_OK:
      break;
    default:
      throw new Error(`UnknownError: Status Code 0x${status.toString(16)}`);
  }
};

const getAccountPath = (path, index) => [
  ...path.slice(0, path.length - 1),
  path[path.length - 1] + index
];

/**
 * An all-inclusive API for accessing a Ledger hardware wallet for the purposes
 * of signing Ethereum transactions.
 */
class LedgerDevice {
  /**
   * The key used to XOR scramble APDUs for transmission to the device.
   *
   * @type {number[]}
   * @private
   */
  static get apduKey() {
    return [0x77, 0x30, 0x77];
  }

  /**
   * The challenge to send to the device when signing transactions.
   *
   * @type {string}
   * @private
   */
  static get challenge() {
    return 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  }

  /**
   * The address of the Ethereum wallet in the classic Ledger device.
   *
   * @type {number[]}
   */
  static get classicPath() {
    return [
      // BIP44/EIP84 Purpose
      ...[0x80, 0x00, 0x00, 0x2c],
      // BIP44/EIP84 Coin Type
      ...[0x80, 0x00, 0x00, 0x3c],
      // BIP44/EIP84 Account
      ...[0x80, 0x02, 0x73, 0xd0],
      // BIP44/EIP84 Change
      ...[0x80, 0x00, 0x00, 0x00]
    ];
  }

  /**
   * The address of the Ethereum wallet in the Ledger Nano S.
   *
   * @type {number[]}
   */
  static get defaultPath() {
    return [
      // BIP44/EIP84 Purpose
      ...[0x80, 0x00, 0x00, 0x2c],
      // BIP44/EIP84 Coin Type
      ...[0x80, 0x00, 0x00, 0x3c],
      // BIP44/EIP84 Account
      ...[0x80, 0x00, 0x00, 0x00],
      // Derivation Path Index
      ...[0x00, 0x00, 0x00, 0x00]
    ];
  }

    /**
   * The address of the Testnet Ethereum wallet in the Ledger Nano S.
   *
   * @type {number[]}
   */
  static get testPath() {
    return [
      // BIP44/EIP84 Purpose
      ...[0x80, 0x00, 0x00, 0x2c],
      // BIP44/EIP84 Coin Type
      ...[0x80, 0x00, 0x00, 0x01],
      // BIP44/EIP84 Account
      ...[0x80, 0x00, 0x00, 0x00],
      // Derivation Path Index
      ...[0x00, 0x00, 0x00, 0x00]
    ];
  }

  /**
   * The default amount of time, in seconds, to wait for the U2F device to
   * respond.
   *
   * @type {number}
   * @private
   */
  static get defaultTimeout() {
    return 30;
  }

  /**
   * The version of the U2F protocol to use when transmitting messages to the
   * device.
   *
   * @type {string}
   * @private
   */
  static get u2fVersion() {
    return 'U2F_V2';
  }

  /**
   * Initializes a new Ledger hardware wallet with the given path.
   *
   * @param {Object} attributes - Named attributes
   * @param {number} [attributes.accountIndex=0] - The index of the account to use within the device
   * @param {string} attributes.appId - The appId to send to the device. Within a web browser, this must be equal to the page's origin
   * @param {number[]} [attributes.path] - The path of the virtual wallet to use on the device
   * @param {number} [attributes.timeout] - The amount of time, in seconds, to wait for the device to respond to requests
   * @param {U2F} attributes.u2f - The implementation of the U2F API to use
   */
  constructor({ accountIndex, appId, path, timeout, u2f }) {
    this.attributes = {
      accountIndex: accountIndex || 0,
      appId,
      path: path || this.constructor.defaultPath,
      timeout: timeout || this.constructor.defaultTimeout,
      u2f
    };
  }

  /**
   * Gets the address of the account used by this device to sign data.
   *
   * @param {number} [index=0] - The index of the address to return
   *
   * @returns {string} Returns a hex string that can be used to identify the account on the Ethereum network.
   * @function
   */
  getAddress = async (index = 0) => {
    const { attributes: { path } } = this;
    const request = createGetAddressRequest(getAccountPath(path, index));
    const response = parseGetAddressResponse(await this.send(request));
    return response.address;
  };

  /**
   * Lists the available addresses of the accounts within this wallet.
   *
   * @param {number} [offset=0] - The offset from the beginning of the list from which to start
   * @param {number} [count=5] - The number of addresses to return
   *
   * @returns {string[]} Returns an array of hex strings that can be used to identify accounts on the Ethereum network.
   * @function
   */
  listAddresses = (offset = 0, count = 5) => {
    const addresses = [];
    for (let index = 0; index < count; index++) {
      addresses.push(this.getAddress(offset + index));
    }
    return Promise.all(addresses);
  };

  /**
   * Sends raw APDUs to the Ledger device, in sequence, and returns the
   * resulting buffer. If no APDUs are given, returns `undefined`.
   *
   * @param {Buffer[]} apdus - The raw APDUs to be transmitted to the Ledger device
   *
   * @returns {Buffer} Returns the U2F signatureData of the last APDU.
   *
   * @throws {Error} Throws an error if something goes wrong while communicating
   * with the U2F device, or if the signatureData of any APDU ends with a byte
   * sequence other than 0x9000.
   *
   * @private
   * @function
   */
  send = async (apdus = []) => {
    const {
      attributes: { appId, timeout, u2f },
      constructor: { apduKey, challenge, u2fVersion }
    } = this;

    // eslint-disable-next-line max-params
    const keyHandles = apdus.map((apdu) => Array.from(apdu).reduce((output, value, index, input) => {
      const current = output || new Buffer(input.length);
      current[index] = input[index] ^ apduKey[index % apduKey.length];
      return current;
    }, false));

    for (let keyHandle = keyHandles.shift(); keyHandle; keyHandle = keyHandles.shift()) {
      // eslint-disable-next-line no-await-in-loop
      const signature = await new Promise((resolve, reject) => {
        u2f.sign(appId, challenge, [{
          keyHandle: Base64.toBase64URLSafe(keyHandle),
          version: u2fVersion
        }], ({ errorCode, signatureData }) => {
          if (typeof errorCode === 'undefined') {
            resolve(Base64.fromBase64URLSafe(signatureData));
          } else {
            reject(U2FSignError.from(errorCode));
          }
        }, timeout);
      });

      assertStatus(signature);

      if (keyHandles.length === 0) {
        return signature;
      }
    }

    return undefined;
  };

  /**
   * Provides a signature for the given input buffer.
   *
   * @param {Buffer} inputBuffer - The input buffer to be signed.
   *
   * @returns {string} Returns a hex string that can be used as the `sig` attribute on an Ethereum transaction.
   * @function
   */
  sign = async (inputBuffer) => {
    const { attributes: { accountIndex, path } } = this;
    const request = createSignRequest(getAccountPath(path, accountIndex), inputBuffer);
    const response = parseSignResponse(await this.send(request));
    return response;
  };
}

export default LedgerDevice;
