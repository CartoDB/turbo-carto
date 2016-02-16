'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-factory');
var columnName = require('../helper/column-name');
var postcss = require('postcss');

module.exports = function (datasource, decl) {
  return function fn$ramp (column, min, max, method) {
    debug('fn$ramp(%j)', arguments);
    debug('Using "%s" datasource to calculate ramp', datasource.getName());

    method = method || 'quantiles';

    return ramp(datasource, column, method, min, max)
      .then(function (rampResult) {
        var parent = decl.parent;
        var start = rampResult.shift();

        column = columnName(column);
        rampResult = rampResult.reverse();

        parent.append(postcss.decl({ prop: decl.prop, value: start }));

        for (var i = 0; i < rampResult.length; i += 2) {
          var rule = postcss.rule({
            selector: '[ ' + column + ' < ' + rampResult[i + 1] + ' ]'
          });
          rule.append(postcss.decl({ prop: decl.prop, value: rampResult[i] }));
          parent.append(rule);
        }

        decl.remove();

        return rampResult;
      });
  };
};

function ramp (datasource, column, method, min, max) {
  if (!Array.isArray(min)) {
    return numericRamp(datasource, column, method, min, max);
  }

  var scheme = min;
  return colorRamp(datasource, column, method, scheme);
}

function getRamp (datasource, column, method) {
  return new Promise(function (resolve, reject) {
    datasource.getRamp(columnName(column), method, function (err, ramp) {
      if (err) {
        return reject(err);
      }
      resolve(ramp);
    });
  });
}

function colorRamp (datasource, column, method, scheme) {
  return getRamp(datasource, column, method)
    .then(function (ramp) {
      var i;
      var rampResult = [];

      rampResult.push(scheme[0]);

      for (i = 0; i < 5; i++) {
        rampResult.push(ramp[i]);
        rampResult.push(scheme[i]);
      }

      return rampResult;
    });
}

function numericRamp (datasource, column, method, min, max) {
  return getRamp(datasource, column, method)
    .then(function (ramp) {
      var i;
      var rampResult = [];

      min = +min;
      max = +max;
      var range = max - min;
      var width = range / 5;
      rampResult.push(min);
      for (i = 0; i < 5; i++) {
        rampResult.push(ramp[i]);
        rampResult.push(min + ((i + 1) * width));
      }

      return rampResult;
    });
}

module.exports.fnName = 'ramp';
