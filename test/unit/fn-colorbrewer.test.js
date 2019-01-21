'use strict';

var assert = require('assert');
var fnColorbrewer = require('../../src/fn/fn-colorbrewer');

describe('fn-colorbrewer', function () {
  var fn = fnColorbrewer();

  it('should return by default 5 data classes', function (done) {
    fn('Reds').then(function (result) {
      assert.strictEqual(result.get().length, 5);
      done();
    });
  });

  it('should return at least 3 data classes', function (done) {
    fn('Reds', 1).then(function (result) {
      assert.strictEqual(result.get().length, 3);
      done();
    });
  });

  it('should return at most 8 data classes', function (done) {
    fn('Dark2', 9).then(function (result) {
      assert.strictEqual(result.get().length, 8);
      done();
    });
  });

  [3, 4, 5, 6, 7].forEach(function (numberDataClasses) {
    it('should return the correct number of data classes for param=' + numberDataClasses, function (done) {
      fn('Reds', numberDataClasses).then(function (result) {
        assert.strictEqual(result.get().length, numberDataClasses);
        done();
      });
    });
  });
});
