'use strict';

var TurboCartoError = require('../../helper/turbo-carto-error');
var postcss = require('postcss');

function RampResult (values, filters, mapping) {
  this.values = values;
  this.filters = filters;
  this.mapping = mapping || '>';
  this.mapping = this.mapping === '==' ? '=' : this.mapping;
}

module.exports = RampResult;

var STRATEGIES_SUPPORTED = {
  /**
   * `equality` will get as many values - 1, and will filter `column` with those filters,
   * last value will be used as default value.
   * Example:
   *  ```css
   *  marker-fill: ramp([cat_column], (red, green, blue, black), (1, 2, 3), ==);
   *  ```
   *
   * will generate:
   *  ```css
   *  marker-width: black;
   *  [cat_column = 1] {
   *    marker-width: red;
   *  }
   *  [cat_column = 2] {
   *    marker-width: green;
   *  }
   *  [cat_column = 3] {
   *    marker-width: blue;
   *  }
   *  ```
   *
   * This is useful for category ramps.
   * This works for numeric and string filters.
   */
  '=': 'equality',
  '==': 'equality',

  /**
   * `greater_than` and `greater_than_or_equal` will use first value as default value, and will break by first filter.
   * Example:
   *  ```css
   *  marker-width: ramp([price], (4, 8, 16, 32), (100, 200, 500, 600), >);
   *  ```
   *
   * Will generate:
   *  ```css
   *  marker-width: 4;
   *  [price > 100] {
   *    marker-width: 8;
   *  }
   *  [price > 200] {
   *    marker-width: 16;
   *  }
   *  [price > 500] {
   *    marker-width: 32;
   *  }
   *  ```
   *
   *
   *
   * This is useful for quantification methods like jenks, quantiles, and equal intervals.
   * This only work for numeric filters, otherwise it will throw an error.
   */
  '>': 'greater_than_or_equal',
  '>=': 'greater_than_or_equal',

  /**
   * Example:
   *  ```css
   *  marker-width: ramp([price], (4, 8, 16, 32), (50, 75.5, 88, 94.5), <);
   *  ```
   *
   * Will generate:
   *  ```css
   *  marker-width: 32;
   *  [price < 50] {
   *    marker-width: 4;
   *  }
   *  [price < 75.5] {
   *    marker-width: 8;
   *  }
   *  [price < 88] {
   *    marker-width: 16;
   *  }
   *  ```
   *
   * This is useful for quantification methods like headtails.
   * This only work for numeric filters, otherwise it will throw an error.
   */
  '<': 'less_than_or_equal',
  '<=': 'less_than_or_equal'

  /**
   * Future mappings
   * '!=': 'inequality',
   * 'in': 'set_inclusion',
   * '!in': 'set_exclusion',
   */
};

RampResult.prototype.process = function (column, decl, metadataHolder) {
  var strategy = STRATEGIES_SUPPORTED[this.mapping];
  if (strategy === STRATEGIES_SUPPORTED['<']) {
    return this.processLessThanOrEqual(column, decl, metadataHolder);
  } else if (strategy === STRATEGIES_SUPPORTED['==']) {
    return this.processEquality(column, decl, metadataHolder);
  } else {
    return this.processGreaterThanOrEqual(column, decl, metadataHolder);
  }
};

RampResult.supports = function (strategy) {
  return STRATEGIES_SUPPORTED.hasOwnProperty(strategy) || !strategy;
};

RampResult.prototype.processEquality = function (column, decl, metadataHolder) {
  if ((this.filters.getLength()) > this.values.getMaxSize()) {
    throw new TurboCartoError('`' + this.mapping + '` requires more or same values than filters to work.');
  }

  var values = this.values.get(this.filters.getLength() + 1);
  var filters = this.filters.get().map(function (filter) {
    return Number.isFinite(filter) ? filter : '"' + filter + '"';
  });

  var initialDecl = decl;
  var defaultValue = null;
  if (values.length !== filters.length) {
    defaultValue = values[values.length - 1];
    initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
    decl.replaceWith(initialDecl);
  }

  var range = {
    start: 0,
    end: filters.length
  };
  var indexOffset = 0;

  var result = this.processGeneric(
    initialDecl, column, defaultValue, values, filters, range, indexOffset, metadataHolder
  );

  if (values.length === filters.length) {
    decl.remove();
  }

  return result;
};

RampResult.prototype.processGreaterThanOrEqual = function (column, decl, metadataHolder) {
  var buckets = Math.min(this.values.getMaxSize(), this.filters.getMaxSize());

  var values = this.values.get((buckets <= 1) ? buckets + 1 : buckets);
  var filters = this.filters.get(buckets);

  var defaultValue = values[0];
  var initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
  decl.replaceWith(initialDecl);

  var range = {
    start: 0,
    end: Math.max(filters.length - 1, 1)
  };
  var indexOffset = 1;

  return this.processGeneric(initialDecl, column, defaultValue, values, filters, range, indexOffset, metadataHolder);
};

RampResult.prototype.processLessThanOrEqual = function (column, decl, metadataHolder) {
  var values = this.values.get(this.filters.getLength() + 1);
  var filters = this.filters.get();

  var defaultValue = values[values.length - 1];
  var initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
  decl.replaceWith(initialDecl);

  var range = {
    start: 0,
    end: filters.length - 1
  };
  var indexOffset = 0;
  return this.processGeneric(initialDecl, column, defaultValue, values, filters, range, indexOffset, metadataHolder);
};

// jshint maxparams:8
RampResult.prototype.processGeneric = function (decl, column, defaultValue, values, filters,
                                                range, indexOffset, metadataHolder) {
  var metadataRule = {
    selector: selector(decl.parent),
    prop: decl.prop,
    mapping: this.mapping,
    'default-value': defaultValue,
    filters: [],
    values: [],
    stats: this.filters.stats
  };

  var previousNode = decl;
  filters.slice(range.start, range.end).forEach(function (filter, index) {
    var rule = postcss.rule({
      selector: '[ ' + column + ' ' + this.mapping + ' ' + filter + ' ]'
    });
    rule.append(postcss.decl({ prop: decl.prop, value: values[index + indexOffset] }));

    metadataRule.filters.push(filter);
    metadataRule.values.push(values[index + 1]);

    rule.moveAfter(previousNode);
    previousNode = rule;
  }.bind(this));

  if (metadataHolder) {
    metadataHolder.add(metadataRule);
  }

  return { values: values, filters: filters, mapping: this.mapping };
};

function selector (node, repr) {
  repr = repr || '';
  if (node && node.type !== 'root') {
    repr = selector(node.parent, node.selector + repr);
  }
  return repr;
}
