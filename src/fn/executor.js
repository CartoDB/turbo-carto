'use strict';

require('es6-promise').polyfill();

var debug = require('../helper/debug')('fn-executor');
var FnFactory = require('./factory');

function FnExecutor (datasource, fnName, fnArgs, decl, metadataHolder) {
  this.datasource = datasource;
  this.fnName = fnName;
  this.args = fnArgs;
  this.decl = decl;
  this.metadataHolder = metadataHolder;
}

module.exports = FnExecutor;

FnExecutor.prototype.exec = function () {
  var self = this;
  debug('[ENTERING] Fn.prototype.exec %s(%j)', self.fnName, self.args);

  var backendFn = FnFactory.create(self.fnName, self.datasource, self.decl, self.metadataHolder);

  return Promise.all(self.getNestedFns())
    .then(function (nestedFnResults) {
      debug('[QUEUE DONE] %s=%j', self.fnName, nestedFnResults);

      nestedFnResults.forEach(function (nestedFnResult) {
        self.args[nestedFnResult.index] = nestedFnResult.result;
      });

      return backendFn.apply(backendFn, self.args);
    });
};

FnExecutor.prototype.getNestedFns = function () {
  var self = this;

  return self.getNestedFnIndexes()
    .map(function (nestedFnIndex) {
      return self.execFn(nestedFnIndex);
    });
};

FnExecutor.prototype.getNestedFnIndexes = function () {
  return this.args.reduce(function (nestedFns, arg, index) {
    if (arg instanceof FnExecutor) {
      nestedFns.push(index);
    }
    return nestedFns;
  }, []);
};

FnExecutor.prototype.execFn = function (nestedFnIndex) {
  return this.args[nestedFnIndex].exec()
    .then(function (result) {
      return { index: nestedFnIndex, result: result };
    });
};
