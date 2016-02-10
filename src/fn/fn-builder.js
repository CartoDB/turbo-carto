'use strict';

require('es6-promise').polyfill();

var FnExecutor = require('./fn-executor');

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

FnBuilder.prototype.exec = function () {
  var executorsExec = this.fnExecutors.map(function (fnExecutor) {
    return fnExecutor.fnExecutor.exec()
      .then(function (result) {
        return { decl: fnExecutor.decl, result: result };
      });
  });

  return Promise.all(executorsExec);
};
