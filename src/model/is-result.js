'use strict';

var ValuesResult = require('./values-result');
var FiltersResult = require('./filters-result');

function isResult (obj) {
  return typeof obj === 'object' && obj !== null &&
    (obj.constructor === ValuesResult || obj.constructor === FiltersResult);
}

module.exports = isResult;
