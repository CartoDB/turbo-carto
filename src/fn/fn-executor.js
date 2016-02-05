'use strict';

var debug = require('../helper/debug')('fn-executor');
var queue = require('queue-async');
var FnFactory = require('./fn-factory');

function FnExecutor (datasource, fnName, fnArgs) {
  this.datasource = datasource;
  this.fnName = fnName;
  this.args = fnArgs;
}

module.exports = FnExecutor;

FnExecutor.prototype.exec = function (callback) {
  debug('[ENTERING] Fn.prototype.exec %s(%j)', this.fnName, this.args);
  var backendFn = FnFactory.create(this.fnName, this.datasource);
  var nestedFnIndexes = this.args.reduce(function (nestedFns, arg, index) {
    if (arg instanceof FnExecutor) {
      nestedFns.push(index);
    }
    return nestedFns;
  }, []);

  var nestedFnsQueue = queue(nestedFnIndexes.length || 1);
  nestedFnIndexes.forEach(function (nestedFnIndex) {
    debug('[QUEUE DEFER] %s', this.args[nestedFnIndex].fnName);
    nestedFnsQueue.defer(function (fn, nestedFnIndex, done) {
      fn.exec(function (err, result) {
        debug('[NESTED RESULT] %s=%j', fn.fnName, result);
        return done(err, { index: nestedFnIndex, result: result });
      });
    }, this.args[nestedFnIndex], nestedFnIndex);
  }.bind(this));

  nestedFnsQueue.awaitAll(function (err, nestedFnResults) {
    debug('[QUEUE DONE] %s=%j', this.fnName, nestedFnResults);
    if (err) {
      return callback(err);
    }
    nestedFnResults.forEach(function (nestedFnResult) {
      this.args[nestedFnResult.index] = nestedFnResult.result;
    }.bind(this));

    backendFn.apply(backendFn, this.args.concat(callback));
  }.bind(this));
};
