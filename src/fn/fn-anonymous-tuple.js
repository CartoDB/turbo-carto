'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-anonymous-tuple');
var ValuesResult = require('../model/values-result');

module.exports = function () {
  return function fn$anonymousTuple () {
    debug('fn$anonymousTuple(%j)', arguments);
    var args = arguments;
    return new Promise(function (resolve) {
      var tupleValues = Object.keys(args).map(function (k) { return args[k]; });
      resolve(new ValuesResult(tupleValues));
    });
  };
};

module.exports.fnName = 'anonymousTuple';
