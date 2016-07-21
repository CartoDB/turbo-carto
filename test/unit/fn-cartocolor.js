'use strict';

var assert = require('assert');
var fnCartoColor = require('../../src/fn/fn-cartocolor');

describe('fn-cartocolor', function () {
  var fn = fnCartoColor();

  it('should return by default 5 data classes', function (done) {
    fn('BluGrn').then(function (result) {
      assert.equal(result.get().length, 5);
      done();
    });
  });

  it('should return at least 2 data classes', function (done) {
    fn('Peach', 1).then(function (result) {
      assert.equal(result.get().length, 2);
      done();
    });
  });

  it('should return at most 7 data classes', function (done) {
    fn('RedOr', 9).then(function (result) {
      assert.equal(result.get().length, 7);
      done();
    });
  });

  [3, 4, 5, 6, 7].forEach(function (numberDataClasses) {
    it('should return the correct number of data classes for param=' + numberDataClasses, function (done) {
      fn('ArmyRose', numberDataClasses).then(function (result) {
        assert.equal(result.get().length, numberDataClasses);
        done();
      });
    });
  });
});
