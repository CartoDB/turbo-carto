'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-category');
var LazyFiltersResult = require('../model/lazy-filters-result');
var fnBuckets = require('./fn-buckets');

module.exports = function (datasource) {
  return function fn$category (numBuckets) {
    debug('fn$category(%j)', arguments);
    debug('Using "%s" datasource to calculate categories', datasource.getName());
    return new Promise(function (resolve) {
      return resolve(new LazyFiltersResult(function (column) {
        return fnBuckets(datasource)(column, 'category', numBuckets);
      }), 'exact');
    });
  };
};

module.exports.fnName = 'category';
