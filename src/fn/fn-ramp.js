'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-factory');
var columnName = require('../helper/column-name');

module.exports = function (datasource) {
  return function fn$ramp (column, min, max, method) {
    debug('fn$ramp(%j)', arguments);
    debug('Using "%s" datasource to calculate ramp', datasource.getName());

    var i;
    var rampResult = [];

    method = method || 'quantiles';

    if (Array.isArray(min)) {
      // color ramp:
      var scheme = min;

      return new Promise(function (resolve, reject) {
        datasource.getRamp(columnName(column), method, function (err, ramp) {
          if (err) {
            return reject(err);
          }
          rampResult.push(scheme[0]);
          for (i = 0; i < 5; i++) {
            rampResult.push(ramp[i]);
            rampResult.push(scheme[i]);
          }
          resolve(rampResult);
        });
      });
    } else {
      // numeric ramp
      return new Promise(function (resolve, reject) {
        datasource.getRamp(columnName(column), method, function (err, ramp) {
          if (err) {
            return reject(err);
          }
          min = +min;
          max = +max;
          var range = max - min;
          var width = range / 5;
          rampResult.push(min);
          for (i = 0; i < 5; i++) {
            rampResult.push(ramp[i]);
            rampResult.push(min + ((i + 1) * width));
          }
          resolve(rampResult);
        });
      });
    }
  };
};

module.exports.fnName = 'ramp';
