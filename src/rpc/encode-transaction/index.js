import { Buffer } from 'buffer';
import FIELDS from './fields';
import Hex from '../../helpers/hex';

import rlp from 'rlp';

const EMPTY_BUFFER = new Buffer([]);

const encodeTransaction = (transaction) => rlp.encode(FIELDS.reduce((encodedTransaction, field) => {
  const defaultValue = field.default || EMPTY_BUFFER;
  const valueAsString = transaction[field.name] || transaction[field.alias];

  if (valueAsString) {
    encodedTransaction.push(new Buffer(Hex.normalize(valueAsString).replace(/^0x/g, ''), 'hex'));
  } else {
    encodedTransaction.push(defaultValue);
  }

  return encodedTransaction;
}, []));

export default encodeTransaction;
