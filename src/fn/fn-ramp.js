'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-ramp');
var columnName = require('../helper/column-name');
var TurboCartoError = require('../helper/turbo-carto-error');
var isResult = require('../model/is-result');
var linearBuckets = require('../helper/linear-buckets');
var ValuesResult = require('../model/values-result');
var FiltersResult = require('../model/filters-result');
var LazyFiltersResult = require('../model/lazy-filters-result');
var postcss = require('postcss');

function createSplitStrategy (selector) {
  return function splitStrategy (column, rampResult, decl) {
    var defaultValue = rampResult[1];
    var initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
    decl.replaceWith(initialDecl);

    var previousNode = initialDecl;
    for (var i = 2, until = rampResult.length; i < until; i += 2) {
      var rule = postcss.rule({
        selector: selector(column, rampResult[i])
      });
      rule.append(postcss.decl({ prop: decl.prop, value: rampResult[i + 1] }));

      rule.moveAfter(previousNode);
      previousNode = rule;
    }

    return rampResult;
  };
}

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

  split: createSplitStrategy(function gtSelector (column, value) {
    return '[ ' + column + ' > ' + value + ' ]';
  }),

  exact: createSplitStrategy(function exactSelector (column, value) {
    return Number.isFinite(value) ? '[ ' + column + ' = ' + value + ' ]' : '[ ' + column + ' = "' + value + '" ]';
  })
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
        throw new TurboCartoError('Failed to process "' + decl.prop + '" property:', err, context);
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
  if (args.length === 0) {
    return Promise.reject(
      new TurboCartoError('invalid number of arguments')
    );
  }

  /**
   * Overload scenarios to support
   * marker-width: ramp([price], 4, 100);
   * marker-width: ramp([price], 4, 100, method);
   * marker-width: ramp([price], 4, 100, 5, method);
   * marker-width: ramp([price], 4, 100, 3, (100, 200, 1000));
   * marker-width: ramp([price], 4, 100, (100, 150, 250, 200, 1000));
   */
  if (Number.isFinite(+args[0])) {
    return compatibilityNumericRamp(datasource, column, args);
  }

  /**
   * Overload methods to support
   * marker-fill: ramp([price], colorbrewer(Reds));
   * marker-fill: ramp([price], colorbrewer(Reds), jenks);
   */
  if (!isResult(args[1])) {
    return compatibilityValuesRamp(datasource, column, args);
  }

  /**
   * Overload methods to support from here
   * marker-fill: ramp([price], colorbrewer(Reds), (100, 200, 300, 400, 500));
   * marker-fill: ramp([price], colorbrewer(Reds), (100, 200, 300, 400, 500), =);
   * marker-fill: ramp([price], (...values), (...filters), [mapping]);
   */
  var values = args[0];
  var filters = args[1];
  var mapping = args[2];
  var strategy = strategyFromMapping(mapping);
  filters = filters.is(ValuesResult) ? new FiltersResult(filters.get(), strategy) : filters;
  if (filters.is(LazyFiltersResult)) {
    return filters.get(column).then(createRampFn(values));
  } else {
    return Promise.resolve(filters).then(createRampFn(values));
  }
}

function strategyFromMapping (mapping) {
  if (mapping === '=' || mapping === 'category') {
    return 'exact';
  }
  return 'split';
}

/**
 * Overload methods to support
 * marker-fill: ramp([price], colorbrewer(Reds));
 * marker-fill: ramp([price], colorbrewer(Reds), jenks);
 */
function compatibilityValuesRamp (datasource, column, args) {
  var values = args[0];
  var method = (args[1] || 'quantiles').toLowerCase();
  var numBuckets = values.getLength();
  return getRamp(datasource, column, numBuckets, method).then(compatibilityCreateRampFn(values));
}

/**
 * Overload scenarios to support
 * marker-width: ramp([price], 4, 100);
 * marker-width: ramp([price], 4, 100, method);
 * marker-width: ramp([price], 4, 100, 5, method); √
 * marker-width: ramp([price], 4, 100, 3, (100, 200, 1000)); √
 * marker-width: ramp([price], 4, 100, (100, 150, 250, 200, 1000)); √
 */
function compatibilityNumericRamp (datasource, column, args) {
  // jshint maxcomplexity:9
  if (args.length < 2) {
    return Promise.reject(
      new TurboCartoError('invalid number of arguments')
    );
  }

  var min = +args[0];
  var max = +args[1];

  var numBuckets;
  var filters = null;
  var method;

  if (Number.isFinite(+args[2])) {
    numBuckets = +args[2];

    if (isResult(args[3])) {
      filters = args[3];
      method = null;
      if (filters.getLength() !== numBuckets) {
        return Promise.reject(
          new TurboCartoError(
              'invalid ramp length, got ' + filters.getLength() + ' values, expected ' + numBuckets
          )
        );
      }
    } else {
      filters = null;
      method = args[3];
    }
  } else if (isResult(args[2])) {
    filters = args[2];
    numBuckets = filters.getLength();
    method = null;
  } else {
    filters = null;
    numBuckets = 5;
    method = args[2];
  }

  var values = new ValuesResult([min, max], numBuckets, linearBuckets, Number.POSITIVE_INFINITY);

  if (filters === null) {
    // normalize method
    method = (method || 'quantiles').toLowerCase();
    return getRamp(datasource, column, numBuckets, method).then(compatibilityCreateRampFn(values));
  }

  filters = filters.is(FiltersResult) ? filters : new FiltersResult(filters.get(), 'max');
  return Promise.resolve(filters).then(compatibilityCreateRampFn(values));
}

function getRamp (datasource, column, buckets, method) {
  return new Promise(function (resolve, reject) {
    datasource.getRamp(columnName(column), buckets, method, function (err, filters) {
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
}

function compatibilityCreateRampFn (valuesResult) {
  return function prepareRamp (filtersResult) {
    var buckets = Math.min(valuesResult.getLength(), filtersResult.getLength());

    var i;
    var rampResult = [];

    var filters = filtersResult.get();
    var values = valuesResult.get();

    if (buckets > 0) {
      for (i = 0; i < buckets; i++) {
        rampResult.push(filters[i]);
        rampResult.push(values[i]);
      }
    } else {
      rampResult.push(null, values[0]);
    }

    return { ramp: rampResult, strategy: filtersResult.getStrategy() };
  };
}

function createRampFn (valuesResult) {
  return function prepareRamp (filtersResult) {
    var buckets = Math.min(valuesResult.getMaxSize(), filtersResult.getMaxSize());

    var i;
    var rampResult = [];

    var filters = filtersResult.get();
    var values = valuesResult.get(buckets);

    if (buckets > 0) {
      for (i = 0; i < buckets; i++) {
        rampResult.push(filters[i]);
        rampResult.push(values[i]);
      }
    } else {
      rampResult.push(null, values[0]);
    }

    return { ramp: rampResult, strategy: filtersResult.getStrategy() };
  };
}

module.exports.fnName = 'ramp';
