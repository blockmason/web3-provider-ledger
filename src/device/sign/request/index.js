/* eslint no-magic-numbers: ["off"] */

import { Buffer } from 'buffer';

// eslint-disable-next-line max-statements
const createSignRequest = (path, inputBuffer) => {
  const chunkSize = 150;
  const headerSize = 5;
  const apdus = [];

  let offset = 0;

  while (offset !== inputBuffer.length) {
    if (offset === 0) {
      const pathSize = 1 + path.length;
      const dataSize = Math.min(inputBuffer.length - offset, chunkSize - headerSize - pathSize);
      const apdu = Buffer.alloc(headerSize + pathSize + dataSize);
      // Command: signTransaction() (0xe004)
      apdu[0] = 0xe0;
      apdu[1] = 0x04;
      // 0x00 if first APDU, 0x80 if continuation
      apdu[2] = 0x00;
      // Constant 0x00 (?)
      apdu[3] = 0x00;
      // Body Length
      apdu[4] = pathSize + dataSize;
      // Path Length (in words)
      // eslint-disable-next-line prefer-destructuring
      apdu[5] = path.length / 4;
      // Path Data
      Buffer.from(path).copy(apdu, headerSize + 1, 0, path.length);
      // Data
      inputBuffer.copy(apdu, headerSize + pathSize, offset, offset + dataSize);

      apdus.push(apdu);

      offset += dataSize;
    } else {
      const dataSize = Math.min(inputBuffer.length - offset, chunkSize - headerSize);
      const apdu = Buffer.alloc(headerSize + dataSize);
      // Command: signTransaction() (0xe004)
      apdu[0] = 0xe0;
      apdu[1] = 0x04;
      // 0x00 if first APDU, 0x80 if continuation
      apdu[2] = 0x80;
      // Constant 0x00 (?)
      apdu[3] = 0x00;
      // Body Length
      apdu[4] = dataSize;
      // Data
      inputBuffer.copy(apdu, headerSize, offset, offset + dataSize);

      apdus.push(apdu);

      offset += dataSize;
    }
  }

  return apdus;
};

export default createSignRequest;
