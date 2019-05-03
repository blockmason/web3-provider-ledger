import { Buffer } from 'buffer';
import FIELDS from './fields';
import Hex from '../../helpers/hex';

import { encode } from 'rlp';

const EMPTY_BUFFER = Buffer.from([]);

const encodeTransaction = (transaction) => encode(FIELDS.reduce((encodedTransaction, field) => {
  const defaultValue = field.default || EMPTY_BUFFER;
  const valueAsString = transaction[field.name] || transaction[field.alias];

  if (valueAsString) {
    encodedTransaction.push(Buffer.from(Hex.normalize(valueAsString).replace(/^0x/g, ''), 'hex'));
  } else {
    encodedTransaction.push(defaultValue);
  }

  return encodedTransaction;
}, []));

export default encodeTransaction;
