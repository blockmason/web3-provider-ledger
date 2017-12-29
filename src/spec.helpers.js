/* global context, describe, it */

import chai from 'chai';
import sinon from 'sinon';

const { expect } = chai;
const { spy, stub } = sinon;

const story = (description, { given = [], when, then }) => it(description, () => then(when(...given())));

export {
  context,
  describe,
  expect,
  it,
  spy,
  story,
  stub
};
