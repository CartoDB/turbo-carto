'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-factory');
var columnName = require('../helper/column-name');
var TurboCartoError = require('../helper/turbo-carto-error');
var FiltersResult = require('../model/filters-result');

module.exports = function (datasource) {
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
        if (!Array.isArray(filters)) {
          strategy = filters.strategy || 'max';
          filters = filters.ramp;
        }
        resolve(new FiltersResult(filters, strategy));
      });
    });
  };
};

module.exports.fnName = 'buckets';
