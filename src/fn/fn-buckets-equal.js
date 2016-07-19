'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-equal');
var LazyFiltersResult = require('../model/lazy-filters-result');
var fnBuckets = require('./fn-buckets');

module.exports = function (datasource) {
  return function fn$equal (numBuckets) {
    debug('fn$equal(%j)', arguments);
    debug('Using "%s" datasource to calculate categories', datasource.getName());
    return new Promise(function (resolve) {
      return resolve(new LazyFiltersResult(function (column, strategy) {
        return fnBuckets(datasource)(column, 'equal', numBuckets).then(function (filters) {
          filters.strategy = strategy || '>';
          return new Promise(function (resolve) {
            return resolve(filters);
          });
        });
      }));
    });
  };
};

module.exports.fnName = 'equal';
