'use strict';

var fns = [
  require('./fn-ramp'),
  require('./fn-colorbrew'),
  require('./fn-cartocolor')
];
var fnMap = fns.reduce(function (fnMap, fn) {
  fnMap[fn.fnName] = fn;
  return fnMap;
}, {});
var fnIdentity = require('./fn-identity');
var fnAnonymousTuple = require('./fn-anonymous-tuple');

var FnFactory = {
  create: function (fnName, datasource, decl) {
    if (fnName === '') {
      return fnAnonymousTuple();
    }

    var fn = fnMap[fnName];
    if (fn) {
      return fn(datasource, decl);
    }

    return fnIdentity(fnName);
  }
};

module.exports = FnFactory;
