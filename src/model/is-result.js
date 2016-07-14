var Result = require('./result');
var LazyResult = require('./lazy-result');

function isResult(obj) {
  return typeof obj === 'object' && (obj.constructor === LazyResult || obj.constructor === Result)
}

module.exports = isResult;
