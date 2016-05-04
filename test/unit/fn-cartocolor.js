'use strict';

var assert = require('assert');
var fnCartoColor = require('../../src/fn/fn-cartocolor');

describe('fn-cartocolor', function () {
  var fn = fnCartoColor();

  it('should return by default 5 data classes', function (done) {
    fn('Green2').then(function (result) {
      assert.equal(result.length, 5);
      done();
    });
  });

  it('should return at least 3 data classes', function (done) {
    fn('Green2', 1).then(function (result) {
      assert.equal(result.length, 3);
      done();
    });
  });

  it('should return at most 7 data classes', function (done) {
    fn('Green2', 9).then(function (result) {
      assert.equal(result.length, 7);
      done();
    });
  });

  [3, 4, 5, 6, 7].forEach(function (numberDataClasses) {
    it('should return the correct number of data classes for param=' + numberDataClasses, function (done) {
      fn('Green2', numberDataClasses).then(function (result) {
        assert.equal(result.length, numberDataClasses);
        done();
      });
    });
  });
});
