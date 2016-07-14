'use strict';

var assert = require('assert');
var fnAnonymousTuple = require('../../src/fn/fn-anonymous-tuple');

describe('fn-anonymous-tuple', function () {
  var fn = fnAnonymousTuple();
  it('should return given strings', function (done) {
    fn('red', 'green', 'blue').then(function (result) {
      assert.deepEqual(result.get(), [ 'red', 'green', 'blue' ]);
      done();
    });
  });

  it('should return given numbers', function (done) {
    fn(9, 8, 7).then(function (result) {
      assert.deepEqual(result.get(), [ 9, 8, 7 ]);
      done();
    });
  });
});
