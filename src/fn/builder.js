'use strict';

require('es6-promise').polyfill();

var FnExecutor = require('./executor');

function FnBuilder (datasource) {
  this.datasource = datasource;
  this.fnExecutors = [];
}

module.exports = FnBuilder;

FnBuilder.prototype.add = function (decl, fnNode, metadataHolder) {
  this.fnExecutors.push({ decl: decl, fnExecutor: createFnExecutor(fnNode, this.datasource, decl, metadataHolder) });
};

function createFnExecutor (fnNode, datasource, decl, metadataHolder) {
  var fnArgs = [];
  if (Array.isArray(fnNode.nodes)) {
    fnArgs = fnNode.nodes.reduce(function (args, nestedFnNode) {
      switch (nestedFnNode.type) {
        case 'word':
          if (Number.isFinite(+nestedFnNode.value)) {
            args.push(+nestedFnNode.value);
          } else {
            args.push(nestedFnNode.value);
          }
          break;
        case 'string':
          args.push(nestedFnNode.value);
          break;
        case 'function':
          args.push(createFnExecutor(nestedFnNode, datasource, decl, metadataHolder));
          break;
        default:
      // pass: includes 'div', 'space', 'comment'
      }
      return args;
    }, []);
  }
  return new FnExecutor(datasource, fnNode.value, fnArgs, decl, metadataHolder);
}

FnBuilder.prototype.exec = function () {
  var executorsExec = this.fnExecutors.map(function (fnExecutor) {
    return fnExecutor.fnExecutor.exec();
  });

  return Promise.all(executorsExec);
};
