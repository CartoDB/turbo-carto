'use strict';

var debug = require('../helper/debug')('fn-factory');
var colorbrewer = require('colorbrewer');
var columnName = require('../helper/column-name');

var FnFactory = {
  create: function (fnName, datasource) {
    switch (fnName) {
      case 'buckets':
        return function fn$buckets (column, ramp, callback) {
          debug('fn$buckets(%j)', arguments);
          return callback(null, {
            column: columnName(column),
            start: ramp.shift(),
            ramp: ramp
          });
        };
      case 'ramp':
        // column, min, max, method, callback
        // column, min, max, callback
        // column, scheme, method, callback
        // column, scheme, callback
        return function fn$ramp (column, min, max, method, callback) {
          debug('fn$ramp(%j)', arguments);
          debug('Using "%s" datasource to calculate ramp', datasource.getName());

          var i;
          var rampResult = [];

          if (Array.isArray(min)) {
            // color ramp:
            //  - column, scheme, method, callback
            //  - column, scheme, callback
            var scheme = min;

            if (!callback) {
              callback = method;
              method = max;
            }
            if (!callback) {
              callback = max;
              method = 'quantiles';
            }

            datasource.getRamp(columnName(column), method, function (err, ramp) {
              if (err) {
                return callback(err);
              }
              rampResult.push(scheme[0]);
              for (i = 0; i < 5; i++) {
                rampResult.push(ramp[i]);
                rampResult.push(scheme[i]);
              }
              return callback(null, rampResult);
            });
          } else {
            // numeric ramp
            //  - column, min, max, method, callback
            //  - column, min, max, callback
            if (!callback) {
              callback = method;
              method = 'quantiles';
            }
            datasource.getRamp(columnName(column), method, function (err, ramp) {
              if (err) {
                return callback(err);
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
              return callback(null, rampResult);
            });
          }
        };
      case 'colorbrewer':
        return function fn$colorbrewer (scheme, callback) {
          if (!callback) {
            callback = scheme;
            scheme = 'PuBu';
          }
          debug('fn$colorbrewer(%j)', arguments);
          var result = colorbrewer.PuBu[5];
          var def = colorbrewer[scheme];
          if (def) {
            result = def[5];
          }
          return callback(null, result);
        };
      default:
        throw new Error('Unsupported function/nesting found in function "' + fnName + '"');
    //                pass, other functions will be resolved by other preprocessor
    //                return null;
    //                return function fn$identity() {
    //                    var args = new Array(arguments.length);
    //                    for(var i = 0; i < args.length; ++i) {
    //                        //i is always valid index in the arguments object
    //                        args[i] = arguments[i];
    //                    }
    //
    //                    var callback = args.pop();
    //                    console.log('fn$identity %j', args);
    //                    return callback(null, fnName + '(' + args.join(',') + ')');
    //                }
    }
  }
};

module.exports = FnFactory;
