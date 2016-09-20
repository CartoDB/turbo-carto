'use strict';

var fns = [
  require('./fn-buckets'),
  require('./fn-buckets-category'),
  require('./fn-buckets-equal'),
  require('./fn-buckets-headtails'),
  require('./fn-buckets-jenks'),
  require('./fn-buckets-quantiles'),
  require('./fn-cartocolor'),
  require('./fn-colorbrewer'),
  require('./fn-ramp'),
  require('./fn-range')
];
var fnMap = fns.reduce(function (fnMap, fn) {
  fnMap[fn.fnName] = fn;
  return fnMap;
}, {});
var fnIdentity = require('./fn-identity');
var fnAnonymousTuple = require('./fn-anonymous-tuple');

var FnFactory = {
  create: function (fnName, datasource, decl, metadataHolder) {
    if (fnName === '') {
      return fnAnonymousTuple();
    }

    var fn = fnMap[fnName];
    if (fn) {
      return fn(datasource, decl, metadataHolder);
    }

    return fnIdentity(fnName);
  }
};

module.exports = FnFactory;
