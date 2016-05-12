'use strict';

function DummyStrategyDatasource (strategy) {
  this.strategy = strategy;
}

module.exports = DummyStrategyDatasource;

DummyStrategyDatasource.prototype.getName = function () {
  return 'DummyDatasource';
};

DummyStrategyDatasource.prototype.getRamp = function (column, buckets, method, callback) {
  var ramp = [];
  for (var i = 0; i < buckets; i++) {
    ramp.push(i);
  }
  return callback(null, { ramp: ramp, strategy: this.strategy });
};
