'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-jenks');
var LazyFiltersResult = require('../model/lazy-filters-result');
var fnBuckets = require('./fn-buckets');

module.exports = function (datasource) {
  return function fn$jenks (numBuckets) {
    debug('fn$jenks(%j)', arguments);
    debug('Using "%s" datasource to calculate categories', datasource.getName());
    return new Promise(function (resolve) {
      return resolve(new LazyFiltersResult(function (column) {
        return fnBuckets(datasource)(column, 'jenks', numBuckets).then(function (filters) {
          filters.strategy = '>';
          return new Promise(function (resolve) {
            return resolve(filters);
          });
        });
      }));
    });
  };
};

module.exports.fnName = 'jenks';
