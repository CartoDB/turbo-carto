'use strict';

require('es6-promise').polyfill();

var ValuesResult = require('../model/values-result');
var debug = require('../helper/debug')('fn-range');
var linearBuckets = require('../helper/linear-buckets');

module.exports = function () {
  return function fn$range (min, max, numBuckets) {
    debug('fn$range(%j)', arguments);
    return new Promise(function (resolve) {
      var result = [min, max];
      numBuckets = Number.isFinite(numBuckets) ? numBuckets : 5;
      resolve(new ValuesResult(result, numBuckets, linearBuckets, Number.POSITIVE_INFINITY));
    });
  };
};

module.exports.fnName = 'range';
