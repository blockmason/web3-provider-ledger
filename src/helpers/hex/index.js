const BASE = 16;
const EVEN = 2;

const Hex = {
  fromBN: (bn) => Hex.normalize(`0x${bn.toString(BASE)}`),
  fromNumber: (n) => Hex.normalize(`0x${n.toString(BASE)}`),
  normalize: (hexString) => {
    if (hexString.length % EVEN === 0) {
      return hexString;
    }
    return hexString.replace(/^0x/g, '0x0');
  }
};

export default Hex;
