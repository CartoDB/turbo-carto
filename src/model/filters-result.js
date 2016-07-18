'use strict';

var util = require('util');
var ValuesResult = require('./values-result');

function FiltersResult (result, strategy) {
  ValuesResult.call(this, result, result.length);
  this.strategy = strategy;
}

util.inherits(FiltersResult, ValuesResult);

module.exports = FiltersResult;

FiltersResult.prototype.getStrategy = function () {
  return this.strategy;
};
