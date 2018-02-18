/* global origin, u2f */

import LedgerDevice from './device';
import RPC from './rpc';

const JSONRPC_VERSION = '2.0';

/**
 * A web3 provider for signing transactions using a Ledger hardware wallet.
 */
class LedgerProvider {
  /**
   * Create a new web3 provider for signing transactions with a Ledger hardware wallet.
   *
   * @param {Object} [attributes] - Named attributes
   * @param {number} [attributes.accountIndex=0] - If `device` is not provided, this specifies the index of the account within the device to use
   * @param {string} [attributes.appId=origin] - If `device` is not provided, this specifies the appId to provide to the U2F device. In web browsers, the default should suffice.
   * @param {number[]} [attributes.path] - If `device` is not provided, this specifies the path of the virtual wallet to use on the device. Defaults to the path of the first account on the Ledger Nano S.
   * @param {U2F} [attributes.u2f=u2f] - If `device` is not provided, this specifies the U2F API implementation to use for communicating with the U2F device. In web browsers, on pages served via HTTPS, the default should suffice.
   * @param {LedgerDevice} [attributes.device] - The Ledger device to use. Defaults to a Ledger Nano S device using the default account, using a U2F API provided by a `u2f` global, and using an appId of the `origin` global.
   */
  constructor(attributes = {}) {
    if (!attributes.device) {
      if (!attributes.u2f && typeof(u2f) === 'undefined') {
        throw new Error('ArgumentError: No device or `u2f` implementation given, and the U2F API is not provided in this context. Please provide a device or a `u2f` implementation.');
      }

      if (!attributes.appId && typeof(origin) === 'undefined') {
        throw new Error('ArgumentError: No device or `appId` given, and the application ID cannot be derived from the origin in this context. Please provide a device or an `appId`.')
      }
    }

    const device = attributes.device || new LedgerDevice({
      accountIndex: attributes.accountIndex,
      appId: attributes.appId || origin,
      path: attributes.path,
      u2f: attributes.u2f || u2f
    });

    this.attributes = Object.freeze({
      device,
      eth: new RPC(device)
    });
  }

  /**
   * Send a JSON RPC 2.0 payload via this provider, triggering the given callback when the operation has completed.
   *
   * @param {Object} payload - The JSON RPC 2.0 request payload
   * @param {string} payload.id - The request id to which this payload is a response
   * @param {string} payload.jsonrpc - The version of JSON RPC to which this response payload adheres
   * @param {string} payload.method - The method to be called
   * @param {any[]} payload.params - An array of parameters for the requested method
   * @param {LedgerProvider~rpcCallback} callback - The callback to be triggered when the operation has completed
   *
   * @returns {void}
   * @async
   * @function
   */
  sendAsync = async (payload, callback) => {
    const { attributes: { eth } } = this;

    try {
      if (payload.jsonrpc !== JSONRPC_VERSION) {
        throw new Error(`UnsupportedVersion: Expected JSON RPC version ${JSONRPC_VERSION}, got ${payload.jsonrpc} instead.`);
      }

      const methodName = payload.method.replace(/^eth_/g, '');

      if (typeof eth[methodName] !== 'function') {
        // eslint-disable-next-line no-magic-numbers
        throw new Error(JSON.stringify(payload, null, 2));
      }

      callback(undefined, {
        id: payload.id,
        jsonrpc: JSONRPC_VERSION,
        result: await eth[methodName](...payload.params)
      });
    } catch (error) {
      callback(error);
    }
  };
}

/**
 * @callback LedgerProvider~rpcCallback
 *
 * A callback to be triggered when a JSON RPC 2.0 request has been completed.
 *
 * @param {Error} error - The error, if one occurred. Otherwise, this is undefined
 * @param {Object} payload - The JSON RPC 2.0 response payload, if no error occurred. If an error occurred, this is undefined
 * @param {string} payload.id - The request id to which this payload is a response
 * @param {string} payload.jsonrpc - The version of JSON RPC to which this response payload adheres
 * @param {any} payload.result - The result of performing the operation requested in the corresponding request
 *
 * @returns {void}
 */

export default LedgerProvider;
