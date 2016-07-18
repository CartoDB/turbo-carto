'use strict';

require('es6-promise').polyfill();

var cartocolor = require('cartocolor');
var ValuesResult = require('../model/values-result');
var minMaxKeys = require('../helper/min-max-keys');
var debug = require('../helper/debug')('fn-cartocolor');

module.exports = function () {
  return function fn$cartocolor (scheme, numberDataClasses) {
    debug('fn$cartocolor(%j)', arguments);
    return new Promise(function (resolve, reject) {
      if (!cartocolor.hasOwnProperty(scheme)) {
        return reject(new Error('Invalid cartocolor scheme: "' + scheme + '"'));
      }
      var result = cartocolor[scheme];
      var minMax = minMaxKeys(result);
      numberDataClasses = Math.min(minMax.max, Math.max(minMax.min, numberDataClasses || 5));
      resolve(new ValuesResult(result, numberDataClasses, null, minMax.max));
    });
  };
};

module.exports.fnName = 'cartocolor';
