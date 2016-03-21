'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-factory');

module.exports = function () {
  return function fn$colors () {
    var args = arguments
    return new Promise(function (resolve) {
      var colors = Object.keys(args).map(function(k){return args[k]})
      resolve(colors);
    });
  }
};

module.exports.fnName = 'colors';
