'use strict';

var fns = [
  require('./fn-ramp'),
  require('./fn-colorbrew'),
  require('./fn-buckets')
];
var fnIdentity = require('./fn-identity');

var FnFactory = {
  create: function (fnName, datasource, decl) {
    for (var i = 0; i < fns.length; i++) {
      if (fns[i].fnName === fnName) {
        return fns[i](datasource, decl);
      }
    }

    return fnIdentity(fnName);
  }
};

module.exports = FnFactory;
