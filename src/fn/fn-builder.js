'use strict';

var FnExecutor = require('./fn-executor');
var queue = require('queue-async');

function FnBuilder (datasource) {
  this.datasource = datasource;
  this.fnExecutors = [];
}

module.exports = FnBuilder;

FnBuilder.prototype.add = function (decl, fnNode) {
  this.fnExecutors.push({ decl: decl, fnExecutor: createFnExecutor(fnNode, this.datasource) });
};

function createFnExecutor (fnNode, datasource) {
  var fnArgs = [];
  if (Array.isArray(fnNode.nodes)) {
    fnArgs = fnNode.nodes.reduce(function (args, nestedFnNode) {
      switch (nestedFnNode.type) {
        case 'word':
        case 'string':
          args.push(nestedFnNode.value);
          break;
        case 'function':
          args.push(createFnExecutor(nestedFnNode, datasource));
          break;
        default:
      // pass: includes 'div', 'space', 'comment'
      }
      return args;
    }, []);
  }
  return new FnExecutor(datasource, fnNode.value, fnArgs);
}

FnBuilder.prototype.exec = function (callback) {
  var fnExecutorsQueue = queue(this.fnExecutors.length);
  this.fnExecutors.forEach(function (fnExecutor) {
    fnExecutorsQueue.defer(function (decl, fnExecutor, done) {
      fnExecutor.exec(function (err, result) {
        if (err) {
          return done(err);
        }
        return done(null, { decl: decl, result: result });
      });
    }, fnExecutor.decl, fnExecutor.fnExecutor);
  });
  fnExecutorsQueue.awaitAll(callback);
};
