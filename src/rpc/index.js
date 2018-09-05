/**
 * An Ethereum JSON RPC 2.0 implementation that wraps a Ledger device.
 */
class LedgerEthereumRPC {
  /**
   * Creates a new Ethereum JSON RPC 2.0 provider atop a Ledger device.
   *
   * @param {LedgerDevice} device - The device to use for signing transactions
   */
  constructor(device) {
    this.attributes = Object.freeze({ device });
  }

  /**
   * Lists the accounts on the device.
   *
   * @returns {string[]} Returns an array of addresses expressed as `0x`-prefixed hex strings.
   * @function
   */
  accounts = async () => {
    const { attributes: { device } } = this;
    const addresses = await device.listAddresses();
    return addresses.map((address) => `0x${address}`);
  };

  /**
   * Sends the given transaction to the device for signing.
   *
   * @param {Object} transaction - The transaction to be signed
   *
   * @returns {string} Returns the signed transaction, expressed as an unprefixed hex string.
   * @function
   */
  sendTransaction = async (transaction) => {
    const { attributes: { device } } = this;
    const signedTransaction = await device.signTransaction(transaction);
    return signedTransaction;
  };
}

export default LedgerEthereumRPC;
