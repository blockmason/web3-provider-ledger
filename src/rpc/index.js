/* global origin, u2f */

import LedgerDevice from '../device';

import encodeTransaction from './encode-transaction';

class LedgerEthereumRPC {
  constructor() {
    this.attributes = {
      device: new LedgerDevice({ appId: origin, u2f })
    };
  }

  accounts = async () => {
    const { attributes: { device } } = this;
    const addresses = await device.listAddresses();
    return addresses.map((address) => `0x${address}`);
  };

  sendTransaction = async (transaction) => {
    const { attributes: { device } } = this;
    const signature = await device.sign(encodeTransaction(transaction));
    return encodeTransaction({
      ...transaction,
      ...signature
    }).toString('hex');
  };
}

export default LedgerEthereumRPC;
