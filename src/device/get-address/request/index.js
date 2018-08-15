/* eslint no-magic-numbers: ["off"] */

import { Buffer } from 'buffer';

const createGetAddressRequest = (path) => {
  const apdu = Buffer.alloc(6 + path.length);

  // Command: getAddress() (0xe002)
  apdu[0] = 0xe0;
  apdu[1] = 0x02;
  // Ask user for confirmation on device? (boolean)
  apdu[2] = 0x00;
  // Ask for response to include chain code? (boolean)
  apdu[3] = 0x00;

  // Path
  apdu[4] = 1 + path.length;
  apdu[5] = path.length / 4;
  Buffer.from(path).copy(apdu, 6, 0, path.length);

  return [apdu];
};

export default createGetAddressRequest;
