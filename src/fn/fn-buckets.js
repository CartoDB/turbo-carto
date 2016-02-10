'use strict';

require('es6-promise').polyfill();

var columnName = require('../helper/column-name');
var debug = require('../helper/debug')('fn-factory');

module.exports = function () {
  return function fn$buckets (column, ramp) {
    debug('fn$buckets(%j)', arguments);

    return new Promise(function (resolve) {
      resolve({
        column: columnName(column),
        start: ramp.shift(),
        ramp: ramp
      });
    });
  };
};

module.exports.fnName = 'buckets';
