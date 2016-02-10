'use strict';

module.exports = function() {
  // pass, other functions will be resolved by other preprocessor
  return function fn$identity() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; ++i) {
      //i is always valid index in the arguments object
      args[i] = arguments[i];
    }
    var callback = args.pop();
    console.log('fn$identity %j', args);

    return callback(null, 'identity' + '(' + args.join(',') + ')');
  };
};

module.exports.fnName = 'identity';
