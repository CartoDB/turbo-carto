'use strict';

var assert = require('assert');
var fnColors = require('../../src/fn/fn-colors');

describe('fn-colors', function () {
  var fn = fnColors();
  it('should return what its given', function (done) {
    fn('red', 'green', 'blue').then(function (result) {
      assert.deepEqual(result, [ 'red', 'green', 'blue' ]);
      done();
    });
  });
});
