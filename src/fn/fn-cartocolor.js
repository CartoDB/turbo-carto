'use strict';

require('es6-promise').polyfill();

var cartocolor = require('cartocolor');
var debug = require('../helper/debug')('fn-factory');

module.exports = function () {
  return function fn$cartocolor (scheme, numberDataClasses) {
    debug('fn$cartocolor(%j)', arguments);
    numberDataClasses = Math.min(7, Math.max(3, numberDataClasses || 5));
    return new Promise(function (resolve) {
      var result = cartocolor.BluGrn[numberDataClasses];
      var def = cartocolor[scheme];
      if (def) {
        result = def[numberDataClasses];
      }
      resolve(result);
    });
  };
};

module.exports.fnName = 'cartocolor';
