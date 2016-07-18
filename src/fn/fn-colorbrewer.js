'use strict';

require('es6-promise').polyfill();

var colorbrewer = require('colorbrewer');
var ValuesResult = require('../model/values-result');
var minMaxKeys = require('../helper/min-max-keys');
var debug = require('../helper/debug')('fn-colorbrewer');

module.exports = function () {
  return function fn$colorbrewer (scheme, numberDataClasses) {
    debug('fn$colorbrewer(%j)', arguments);
    return new Promise(function (resolve, reject) {
      if (!colorbrewer.hasOwnProperty(scheme)) {
        return reject(new Error('Invalid colorbrewer scheme: "' + scheme + '"'));
      }
      var result = colorbrewer[scheme];
      var minMax = minMaxKeys(result);
      numberDataClasses = Math.min(minMax.max, Math.max(minMax.min, numberDataClasses || 5));
      resolve(new ValuesResult(result, numberDataClasses, null, minMax.max));
    });
  };
};

module.exports.fnName = 'colorbrewer';
