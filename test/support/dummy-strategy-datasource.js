'use strict';

function DummyStrategyDatasource (strategy, generator) {
  this.strategy = strategy;
  this.generator = generator || null;
}

module.exports = DummyStrategyDatasource;

DummyStrategyDatasource.prototype.getName = function () {
  return 'DummyDatasource';
};

DummyStrategyDatasource.prototype.getRamp = function (column, buckets, method, callback) {
  if (this.generator !== null) {
    return callback(null, { ramp: this.generator(buckets), strategy: this.strategy });
  }
  var ramp = [];
  for (var i = 0; i < buckets; i++) {
    ramp.push(i);
  }
  return callback(null, { ramp: ramp, strategy: this.strategy });
};
