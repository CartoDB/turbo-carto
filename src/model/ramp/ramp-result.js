'use strict';

var TurboCartoError = require('../../helper/turbo-carto-error');
var postcss = require('postcss');

function RampResult (values, filters, mapping) {
  this.values = values;
  this.filters = filters;
  this.mapping = mapping || '>';
}

module.exports = RampResult;

var SUPPORTED_STRATEGIES = {
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

RampResult.prototype.process = function (column, decl) {
  var strategy = SUPPORTED_STRATEGIES[this.mapping];
  if (strategy === SUPPORTED_STRATEGIES['<']) {
    return this.processLessThanOrEqual(column, decl);
  } else if (strategy === SUPPORTED_STRATEGIES['==']) {
    return this.processEquality(column, decl);
  } else {
    return this.processGreaterThanOrEqual(column, decl);
  }
};

RampResult.supports = function (strategy) {
  return SUPPORTED_STRATEGIES.hasOwnProperty(strategy) || !strategy;
};

RampResult.prototype.processEquality = function (column, decl) {
  if ((this.filters.getLength()) > this.values.getMaxSize()) {
    throw new TurboCartoError('`' + this.mapping + '` requires more or same values than filters to work.');
  }

  var values = this.values.get(this.filters.getLength() + 1);
  var filters = this.filters.get();

  var initialDecl = decl;
  if (values.length !== filters.length) {
    var defaultValue = values[values.length - 1];
    initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
    decl.replaceWith(initialDecl);
  }

  var previousNode = initialDecl;
  filters.forEach(function (filter, index) {
    var filterSelector = Number.isFinite(filter) ? filter : '"' + filter + '"';
    var rule = postcss.rule({
      selector: '[ ' + column + ' = ' + filterSelector + ' ]'
    });
    rule.append(postcss.decl({ prop: decl.prop, value: values[index] }));

    rule.moveAfter(previousNode);
    previousNode = rule;
  });

  if (values.length === filters.length) {
    decl.remove();
  }

  return { values: values, filters: filters, mapping: this.mapping };
};

RampResult.prototype.processGreaterThanOrEqual = function (column, decl) {
  var buckets = Math.min(this.values.getMaxSize(), this.filters.getMaxSize());

  var values = this.values.get((buckets <= 1) ? buckets + 1 : buckets);
  var filters = this.filters.get(buckets);

  var defaultValue = values[0];
  var initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
  decl.replaceWith(initialDecl);

  var previousNode = initialDecl;
  filters.slice(0, Math.max(filters.length - 1, 1)).forEach(function (filter, index) {
    var rule = postcss.rule({
      selector: '[ ' + column + ' ' + this.mapping + ' ' + filter + ' ]'
    });
    rule.append(postcss.decl({ prop: decl.prop, value: values[index + 1] }));

    rule.moveAfter(previousNode);
    previousNode = rule;
  }.bind(this));

  return { values: values, filters: filters, mapping: this.mapping };
};

RampResult.prototype.processLessThanOrEqual = function (column, decl) {
  var values = this.values.get(this.filters.getLength() + 1);
  var filters = this.filters.get();

  var defaultValue = values[values.length - 1];

  var initialDecl = postcss.decl({ prop: decl.prop, value: defaultValue });
  decl.replaceWith(initialDecl);

  var previousNode = initialDecl;
  filters.slice(0, filters.length - 1).forEach(function (filter, index) {
    var rule = postcss.rule({
      selector: '[ ' + column + ' ' + this.mapping + ' ' + filter + ' ]'
    });
    rule.append(postcss.decl({ prop: decl.prop, value: values[index] }));

    rule.moveAfter(previousNode);
    previousNode = rule;
  }.bind(this));

  return { values: values, filters: filters, mapping: this.mapping };
};
