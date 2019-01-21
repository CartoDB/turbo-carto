'use strict';

var assert = require('assert');
var columnName = require('../../src/helper/column-name');

describe('column-name', function () {
  it('should replace brackets', function () {
    assert.strictEqual(columnName('[wadus_column]'), 'wadus_column');
  });
});
