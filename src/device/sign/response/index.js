// eslint-disable-next-line max-statements
const parseSignResponse = (response) => {
  const vStart = 5;
  const vSize = 1;
  const vEnd = vStart + vSize;
  const v = response.slice(vStart, vEnd);

  const rStart = vEnd;
  const rSize = 32;
  const rEnd = rStart + rSize;
  const r = response.slice(rStart, rEnd);

  const sStart = rEnd;
  const sSize = 32;
  const sEnd = sStart + sSize;
  const s = response.slice(sStart, sEnd);

  return {
    r: `0x${r.toString('hex')}`,
    s: `0x${s.toString('hex')}`,
    v: `0x${v.toString('hex')}`
  };
};

export default parseSignResponse;
