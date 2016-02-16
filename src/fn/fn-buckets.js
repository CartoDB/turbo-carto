'use strict';

require('es6-promise').polyfill();

var columnName = require('../helper/column-name');
var debug = require('../helper/debug')('fn-factory');
var postcss = require('postcss');

module.exports = function (datasource, decl) {
  return function fn$buckets (column, scheme) {
    debug('fn$buckets(%j)', arguments);

    return getRamp(datasource, column)
      .then(function (ramp) {
        var i;
        var rampResult = [];

        rampResult.push(scheme[0]);

        for (i = 0; i < 5; i++) {
          rampResult.push(ramp[i]);
          rampResult.push(scheme[i]);
        }

        var parent = decl.parent;
        var start = rampResult.shift();

        column = columnName(column);
        rampResult = rampResult.reverse();

        parent.append(postcss.decl({ prop: decl.prop, value: start}));

        for (i = 0; i < rampResult.length; i += 2) {
          var rule = postcss.rule({
            selector: '[ ' + column + ' < ' + rampResult[i + 1] + ' ]'
          });
          rule.append(postcss.decl({prop: decl.prop, value: rampResult[i]}));
          parent.append(rule);
        }

        decl.remove();
      });
  };
};

function getRamp(datasource, column, method) {
  return new Promise(function (resolve, reject) {
    datasource.getRamp(columnName(column), method || 'quantiles', function (err, ramp) {
      if (err) {
        return reject(err);
      }
      resolve(ramp);
    });
  });
}

module.exports.fnName = 'buckets';
