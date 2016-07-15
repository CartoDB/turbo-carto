'use strict';

require('es6-promise').polyfill();

var util = require('util');
var FiltersResult = require('./filters-result');

function LazyFiltersResult (filterGenerator, strategy) {
  this.filterGenerator = filterGenerator;
  this.strategy = strategy;
}

util.inherits(LazyFiltersResult, FiltersResult);

module.exports = LazyFiltersResult;

LazyFiltersResult.prototype.get = function (column) {
  return this.filterGenerator(column);
};

