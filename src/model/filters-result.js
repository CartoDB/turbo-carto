'use strict';

var util = require('util');
var ValuesResult = require('./values-result');

function FiltersResult (result, strategy, stats) {
  ValuesResult.call(this, result, result.length);
  this.strategy = strategy;
  this.stats = stats;
}

util.inherits(FiltersResult, ValuesResult);

module.exports = FiltersResult;

FiltersResult.prototype.getStrategy = function () {
  if (this.result.some(nonNumeric)) {
    return '=';
  }
  return this.strategy;
};

function nonNumeric (item) {
  return !Number.isFinite(item);
}
