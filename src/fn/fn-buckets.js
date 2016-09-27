'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-buckets');
var columnName = require('../helper/column-name');
var TurboCartoError = require('../helper/turbo-carto-error');
var FiltersResult = require('../model/filters-result');
var LazyFiltersResult = require('../model/lazy-filters-result');

function fnBuckets (datasource) {
  return function fn$buckets (column, quantificationMethod, numBuckets) {
    debug('fn$buckets(%j)', arguments);
    debug('Using "%s" datasource to calculate buckets', datasource.getName());

    return new Promise(function (resolve, reject) {
      if (!quantificationMethod) {
        return reject(new TurboCartoError('Missing quantification method in buckets function'));
      }
      numBuckets = Number.isFinite(+numBuckets) ? +numBuckets : 5;
      datasource.getRamp(columnName(column), numBuckets, quantificationMethod, function (err, filters) {
        if (err) {
          return reject(
            new TurboCartoError('unable to compute ramp,', err)
          );
        }
        var strategy = 'max';
        var stats = {};
        if (!Array.isArray(filters)) {
          strategy = filters.strategy || 'max';
          stats = filters.stats;
          filters = filters.ramp;
        }
        resolve(new FiltersResult(filters, strategy, stats));
      });
    });
  };
}

module.exports = fnBuckets;
module.exports.fnName = 'buckets';

module.exports.createBucketsFn = function (datasource, alias, defaultStrategy) {
  return function fn$bucketsFn (numBuckets) {
    debug('fn$%s(%j)', alias, arguments);
    debug('Using "%s" datasource to calculate %s', datasource.getName(), alias);
    return new Promise(function (resolve) {
      return resolve(new LazyFiltersResult(function (column, strategy) {
        return fnBuckets(datasource)(column, alias, numBuckets).then(function (filters) {
          filters.strategy = strategy || defaultStrategy;
          return new Promise(function (resolve) {
            return resolve(filters);
          });
        });
      }));
    });
  };
};
