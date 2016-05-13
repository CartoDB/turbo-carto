'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-factory');
var columnName = require('../helper/column-name');
var TurboCartoError = require('../helper/turbo-carto-error');
var buckets = require('../helper/linear-buckets');
var postcss = require('postcss');

var strategy = {
  max: function maxStrategy (column, rampResult, decl) {
    var defaultValue = rampResult[1];
    var initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
    decl.replaceWith(initialDecl);

    var previousNode = initialDecl;
    for (var i = 0, until = rampResult.length - 2; i < until; i += 2) {
      var rule = postcss.rule({
        selector: '[ ' + column + ' > ' + rampResult[i] + ' ]'
      });
      rule.append(postcss.decl({ prop: decl.prop, value: rampResult[i + 3] }));

      rule.moveAfter(previousNode);
      previousNode = rule;
    }

    return rampResult;
  },

  split: function splitStrategy (column, rampResult, decl) {
    var defaultValue = rampResult[1];
    var initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
    decl.replaceWith(initialDecl);

    var previousNode = initialDecl;
    for (var i = 2, until = rampResult.length; i < until; i += 2) {
      var rule = postcss.rule({
        selector: '[ ' + column + ' > ' + rampResult[i] + ' ]'
      });
      rule.append(postcss.decl({ prop: decl.prop, value: rampResult[i + 1] }));

      rule.moveAfter(previousNode);
      previousNode = rule;
    }

    return rampResult;
  }
};

module.exports = function (datasource, decl) {
  return function fn$ramp (column, /* ... */args) {
    debug('fn$ramp(%j)', arguments);
    debug('Using "%s" datasource to calculate ramp', datasource.getName());

    args = Array.prototype.slice.call(arguments, 1);

    return ramp(datasource, column, args)
      .then(function (rampResult) {
        var strategyFn = strategy.hasOwnProperty(rampResult.strategy) ? strategy[rampResult.strategy] : strategy.max;
        return strategyFn(columnName(column), rampResult.ramp, decl);
      })
      .catch(function (err) {
        var context = {};
        if (decl.parent) {
          context.selector = decl.parent.selector;
        }
        if (decl.source) {
          context.source = {
            start: decl.source.start,
            end: decl.source.end
          };
        }
        throw new TurboCartoError('Unable to process "' + decl.prop + '"', err, context);
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
 *  <Number>minVal, <Number>maxValue, <Number>numBuckets
 *
 * [10            , 20,             , 4              , jenks]
 *  <Number>minVal, <Number>maxValue, <Number>numBuckets, <String>method
 */
function ramp (datasource, column, args) {
  var method;

  var tuple = [];

  if (args.length === 0) {
    return Promise.reject(
      new TurboCartoError('Invalid number of arguments')
    );
  }

  if (Array.isArray(args[0])) {
    tuple = args[0];
    method = args[1];
  } else {
    if (args.length < 2) {
      return Promise.reject(
        new TurboCartoError('Invalid number of arguments')
      );
    }

    var min = +args[0];
    var max = +args[1];

    var numBuckets = 5;
    method = args[2];

    if (Number.isFinite(+args[2])) {
      numBuckets = +args[2];
      method = args[3];
    }

    tuple = buckets(min, max, numBuckets);
  }

  return tupleRamp(datasource, column, tuple, method);
}

function getRamp (datasource, column, buckets, method) {
  return new Promise(function (resolve, reject) {
    datasource.getRamp(columnName(column), buckets, method, function (err, ramp) {
      if (err) {
        return reject(
          new TurboCartoError('Unable to compute ramp', err)
        );
      }
      resolve(ramp);
    });
  });
}

function tupleRamp (datasource, column, tuple, method) {
  if (Array.isArray(method)) {
    var ramp = method;
    if (tuple.length !== ramp.length) {
      return Promise.reject(
        new TurboCartoError('Invalid ramp length. Got ' + ramp.length + ' values, expected ' + tuple.length)
      );
    }
    return Promise.resolve({ramp: ramp, strategy: 'split'}).then(createRampFn(tuple));
  }

  // normalize method
  if (method) {
    method = method.toLowerCase();
  }

  return getRamp(datasource, column, tuple.length, method).then(createRampFn(tuple));
}

function createRampFn (tuple) {
  return function prepareRamp (ramp) {
    var strategy = 'max';
    if (!Array.isArray(ramp)) {
      strategy = ramp.strategy || 'max';
      ramp = ramp.ramp;
    }

    var buckets = tuple.length;

    var i;
    var rampResult = [];

    for (i = 0; i < buckets; i++) {
      rampResult.push(ramp[i]);
      rampResult.push(tuple[i]);
    }

    return { ramp: rampResult, strategy: strategy };
  };
}

module.exports.fnName = 'ramp';
