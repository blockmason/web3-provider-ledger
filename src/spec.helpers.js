import { describe, it } from 'mocha';
import { spy, stub } from 'sinon';

import { expect } from 'chai';

const story = (description, { given = [], when, then }) => it(description, () => then(when(...given())));

const context = describe;

export {
  context,
  describe,
  expect,
  it,
  spy,
  story,
  stub
};
