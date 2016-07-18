'use strict';

var ValuesResult = require('./values-result');
var FiltersResult = require('./filters-result');
var LazyFiltersResult = require('./lazy-filters-result');

function isResult (obj) {
  return typeof obj === 'object' && obj !== null &&
    (obj.constructor === ValuesResult || obj.constructor === FiltersResult || obj.constructor === LazyFiltersResult);
}

module.exports = isResult;
