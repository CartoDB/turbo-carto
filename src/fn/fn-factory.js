'use strict';

var fns = [
  require('./fn-ramp'),
  require('./fn-colorbrew'),
  require('./fn-buckets'),
// require('./fn-identity')
];

var FnFactory = {
  create: function (fnName, datasource) {
    for (var i = 0; i < fns.length; i++) {
      if (fns[i].fnName === fnName) {
        return fns[i](datasource);
      }
    }

    throw new Error('Unsupported function/nesting found in function "' + fnName + '"');
  }
};

module.exports = FnFactory;
