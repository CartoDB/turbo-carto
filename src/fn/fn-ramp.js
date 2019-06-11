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
var RampResult = require('../model/ramp/ramp-result');

function createSplitStrategy (mapping) {
  return function splitStrategy (column, rampResult, stats, meta, decl, metadataHolder) {
    var allFilters = rampResult.filter(evenIndex);
    var values = rampResult.filter(reverse(evenIndex));
    var filters = allFilters.slice(1);
    if (mapping === '=') {
      values = values.slice(1).concat([rampResult.filter(reverse(evenIndex))[0]]);
    }
    filters = filters.filter(reverse(isNull));
    var ramp = new RampResult(new ValuesResult(values), new FiltersResult(filters, null, stats, meta), mapping);
    return ramp.process(column, decl, metadataHolder);
  };
}

function evenIndex (value, index) {
  return index % 2 === 0;
}

function isNull (val) {
  return val === null;
}

function reverse (fn, ctx) {
  return function () {
    return !fn.apply(ctx, arguments);
  };
}

var strategy = {
  max: function maxStrategy (column, rampResult, stats, meta, decl, metadataHolder) {
    var values = rampResult.filter(reverse(evenIndex));
    var filters = rampResult.filter(evenIndex).filter(reverse(isNull));
    var ramp = new RampResult(new ValuesResult(values), new FiltersResult(filters, null, stats, meta), '>');
    return ramp.process(column, decl, metadataHolder);
  },

  split: createSplitStrategy('>'),

  exact: createSplitStrategy('='),

  '=': createSplitStrategy('=')
};

module.exports = function (datasource, decl, metadataHolder) {
  return function fn$ramp (column, /* ... */args) {
    debug('fn$ramp(%j)', arguments);
    debug('Using "%s" datasource to calculate ramp', datasource.getName());

    args = Array.prototype.slice.call(arguments, 1);

    return ramp(datasource, column, args)
      .then(function (rampResult) {
        if (rampResult.constructor === RampResult) {
          return rampResult.process(columnName(column), decl, metadataHolder);
        }
        var strategyFn = strategy.hasOwnProperty(rampResult.strategy) ? strategy[rampResult.strategy] : strategy.max;
        return strategyFn(
          columnName(column), rampResult.ramp, rampResult.stats, rampResult.meta, decl, metadataHolder
        );
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
  if (Number.isFinite(args[0])) {
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
    return filters.get(column, strategy).then(createRampFn(values));
  } else {
    return Promise.resolve(filters).then(createRampFn(values));
  }
}

var oldMappings2Strategies = {
  quantiles: 'max',
  equal: 'max',
  jenks: 'max',
  headtails: 'split',
  category: 'exact'
};

function strategyFromMapping (mapping) {
  if (oldMappings2Strategies.hasOwnProperty(mapping)) {
    return oldMappings2Strategies[mapping];
  }
  return mapping;
}

/**
 * Overload methods to support
 * marker-fill: ramp([price], colorbrewer(Reds));
 * marker-fill: ramp([price], colorbrewer(Reds), jenks);
 */
function compatibilityValuesRamp (datasource, column, args) {
  var values = args[0];
  var method = (args[1] || 'quantiles').toLowerCase();

  if (values.is(LazyFiltersResult)) {
    var mapping = args[2];
    var strategy = strategyFromMapping(mapping);

    return values.getLength(column, strategy)
      .then(function (numBuckets) {
        return getRamp(datasource, column, numBuckets, method);
      })
      .then(compatibilityCreateRampFn(values));
  } else {
    var numBuckets = values.getLength();

    return getRamp(datasource, column, numBuckets, method)
      .then(compatibilityCreateRampFn(values));
  }
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

  if (Number.isFinite(args[2])) {
    numBuckets = args[2];

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
      var stats = {};
      var meta = {};
      if (!Array.isArray(filters)) {
        strategy = filters.strategy || 'max';
        stats = filters.stats;
        meta = filters.meta || {};
        filters = filters.ramp;
      }
      resolve(new FiltersResult(filters, strategy, stats, meta));
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

    return {
      ramp: rampResult,
      strategy: filtersResult.getStrategy(),
      stats: filtersResult.stats,
      meta: filtersResult.meta
    };
  };
}

function createRampFn (valuesResult) {
  return function prepareRamp (filtersResult) {
    if (RampResult.supports(filtersResult.getStrategy())) {
      return new RampResult(valuesResult, filtersResult, filtersResult.getStrategy());
    }

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

    return {
      ramp: rampResult,
      strategy: filtersResult.getStrategy(),
      stats: filtersResult.stats,
      meta: filtersResult.meta
    };
  };
}

module.exports.fnName = 'ramp';
