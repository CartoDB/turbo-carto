'use strict';

require('es6-promise').polyfill();

var util = require('util');
var FiltersResult = require('./filters-result');

function LazyFiltersResult (filterGenerator) {
  this.filterGenerator = filterGenerator;
}

util.inherits(LazyFiltersResult, FiltersResult);

module.exports = LazyFiltersResult;

LazyFiltersResult.prototype.get = function (column, strategy) {
  return this.filterGenerator(column, strategy);
};

