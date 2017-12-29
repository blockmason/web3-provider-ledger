/* eslint no-magic-numbers: ["off"] */

// eslint-disable-next-line max-statements
const parseGetAddressResponse = (response) => {
  const headerStart = 0;
  const headerSize = 5;
  const headerEnd = headerStart + headerSize;
  const header = response.slice(headerStart, headerEnd);

  const publicKeyStart = headerEnd + 1;
  const { [headerEnd]: publicKeySize } = response;
  const publicKeyEnd = publicKeyStart + publicKeySize;
  const publicKey = response.slice(publicKeyStart, publicKeyEnd);

  const { [publicKeyEnd]: addressSize } = response;
  const addressStart = publicKeyEnd + 1;
  const addressEnd = addressStart + addressSize;
  const address = response.slice(addressStart, addressEnd);

  return {
    address: address.toString('ascii'),
    header: `0x${header.toString('hex')}`,
    publicKey: `0x${publicKey.toString('hex')}`
  };
};

export default parseGetAddressResponse;
