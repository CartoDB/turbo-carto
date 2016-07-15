'use strict';

var assert = require('assert');
var fnRange = require('../../src/fn/fn-range');

describe('fn-range should return a linear ramp', function () {
  var fn = fnRange();

  it('with 5 buckets as default', function (done) {
    fn(1, 10)
      .then(function (result) {
        assert.deepEqual(result.get(), [1, 3.25, 5.5, 7.75, 10]);
        done();
      })
      .catch(done);
  });

  it('with 4 buckets as defined', function (done) {
    fn(1, 10, 4)
      .then(function (result) {
        assert.deepEqual(result.get(), [1, 4, 7, 10]);
        done();
      })
      .catch(done);
  });

  it('with 4 when overrided', function (done) {
    fn(1, 10)
      .then(function (result) {
        assert.deepEqual(result.get(4), [1, 4, 7, 10]);
        done();
      })
      .catch(done);
  });
});
