import RPC from './rpc';

const JSONRPC_VERSION = '2.0';

const createLedgerWeb3Provider = () => {
  const eth = new RPC();

  return Promise.resolve({
    sendAsync: async (payload, callback) => {
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
    }
  });
};

export default createLedgerWeb3Provider;
