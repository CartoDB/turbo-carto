'use strict';

require('es6-promise').polyfill();

var colorbrewer = require('colorbrewer');
var debug = require('../helper/debug')('fn-factory');

module.exports = function () {
  return function fn$colorbrewer (scheme, numberDataClasses) {
    debug('fn$colorbrewer(%j)', arguments);
    scheme = scheme || 'PuBu';
    numberDataClasses = Math.min(7, Math.max(3, numberDataClasses || 5));
    return new Promise(function (resolve) {
      var result = colorbrewer.PuBu[numberDataClasses];
      var def = colorbrewer[scheme];
      if (def) {
        result = def[numberDataClasses];
      }
      resolve(result);
    });
  };
};

module.exports.fnName = 'colorbrewer';
