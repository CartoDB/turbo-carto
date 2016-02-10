'use strict';

require('es6-promise').polyfill();

var colorbrewer = require('colorbrewer');
var debug = require('../helper/debug')('fn-factory');

module.exports = function () {
  return function fn$colorbrewer (scheme) {
    debug('fn$colorbrewer(%j)', arguments);
    scheme = scheme || 'PuBu';
    return new Promise(function (resolve) {
      var result = colorbrewer.PuBu[5];
      var def = colorbrewer[scheme];
      if (def) {
        result = def[5];
      }
      resolve(result);
    });
  };
};

module.exports.fnName = 'colorbrewer';
