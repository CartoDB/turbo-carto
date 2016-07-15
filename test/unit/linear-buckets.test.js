'use strict';

var assert = require('assert');
var interpolate = require('../../src/helper/linear-buckets');

describe('linear-buckets', function () {
  it('should create an array of buckets', function () {
    assert.deepEqual(interpolate(4, 12, 3), [4, 8, 12]);
    assert.deepEqual(interpolate(1, 10, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.deepEqual(interpolate(1, 20, 2), [1, 20]);
    assert.deepEqual(interpolate(1, 10, 4), [1, 4, 7, 10]);
    assert.deepEqual(interpolate(1, 10, 3), [1, 5.5, 10]);
    assert.deepEqual(interpolate(0, 10, 3), [0, 5, 10]);
    assert.deepEqual(interpolate(0, 10, 3), [0, 5, 10]);
  });

  it('should work with array range as first argument', function () {
    assert.deepEqual(interpolate([0, 10], 3), [0, 5, 10]);
  });
});
