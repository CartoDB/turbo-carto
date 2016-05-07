'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-factory');
var columnName = require('../helper/column-name');
var postcss = require('postcss');

module.exports = function (datasource, decl) {
  return function fn$ramp (column, /* ... */args) {
    debug('fn$ramp(%j)', arguments);
    debug('Using "%s" datasource to calculate ramp', datasource.getName());

    args = Array.prototype.slice.call(arguments, 1);

    return ramp(datasource, column, args)
      .then(function (rampResult) {
        var parent = decl.parent;
        var defaultValue = rampResult[1];

        column = columnName(column);

        parent.append(postcss.decl({ prop: decl.prop, value: defaultValue }));

        for (var i = 0, until = rampResult.length - 2; i < until; i += 2) {
          var rule = postcss.rule({
            selector: '[ ' + column + ' > ' + rampResult[i] + ' ]'
          });
          rule.append(postcss.decl({ prop: decl.prop, value: rampResult[i + 3] }));
          parent.append(rule);
        }

        decl.remove();

        return rampResult;
      });
  };
};

/**
 * @param datasource
 * @param {String} column
 * @param args
 *
 * ####################
 * ###  COLOR RAMP  ###
 * ####################
 *
 * [colorbrewer(Greens, 7), jenks]
 *  <Array>scheme         , <String>method
 *
 * [colorbrewer(Greens, 7)]
 *  <Array>scheme
 *
 * ####################
 * ### NUMERIC RAMP ###
 * ####################
 *
 * [10            , 20]
 *  <Number>minVal, <Number>maxValue
 *
 * [10            , 20,             , jenks]
 *  <Number>minVal, <Number>maxValue, <String>method
 *
 * [10            , 20,             , 4]
 *  <Number>minVal, <Number>maxValue, <Number>buckets
 *
 * [10            , 20,             , 4              , jenks]
 *  <Number>minVal, <Number>maxValue, <Number>buckets, <String>method
 */
function ramp (datasource, column, args) {
  var method;

  var tuple = [];

  if (Array.isArray(args[0])) {
    tuple = args[0];
    method = args[1];
  } else {
    var min = +args[0];
    var max = +args[1];

    var buckets = 5;
    method = args[2];

    if (Number.isFinite(+args[2])) {
      buckets = +args[2];
      method = args[3];
    }

    var range = max - min;
    var width = range / buckets;
    for (var i = 0; i < buckets; i++) {
      tuple.push(min + ((i + 1) * width));
    }
  }

  return tupleRamp(datasource, column, tuple, method);
}

function getRamp (datasource, column, buckets, method) {
  return new Promise(function (resolve, reject) {
    datasource.getRamp(columnName(column), buckets, method, function (err, ramp) {
      if (err) {
        return reject(err);
      }
      resolve(ramp);
    });
  });
}

function tupleRamp (datasource, column, tuple, method) {
  var buckets = tuple.length;
  return getRamp(datasource, column, buckets, method)
    .then(function (ramp) {
      var i;
      var rampResult = [];

      for (i = 0; i < buckets; i++) {
        rampResult.push(ramp[i]);
        rampResult.push(tuple[i]);
      }

      return rampResult;
    });
}

module.exports.fnName = 'ramp';
