'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-identity');

module.exports = function (fnName) {
  return function fn$identity () {
    debug('fn$identity(%j)', arguments);

    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; ++i) {
      // i is always valid index in the arguments object
      if (typeof arguments[i] === 'string') {
        args[i] = '\'' + arguments[i] + '\'';
      } else {
        args[i] = arguments[i];
      }
    }

    return Promise.resolve(fnName + '(' + args.join(',') + ')');
  };
};

module.exports.fnName = 'pass';
