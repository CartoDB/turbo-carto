'use strict';

function DummyDatasource (getter) {
  this.getter = getter || null;
}

module.exports = DummyDatasource;

DummyDatasource.prototype.getName = function () {
  return 'DummyDatasource';
};

DummyDatasource.prototype.getRamp = function (column, buckets, method, callback) {
  if (this.getter) {
    var result = this.getter(column, buckets, method);
    return callback(null, result);
  }
  var ramp = [];
  for (var i = 0; i < buckets; i++) {
    ramp.push(i);
  }
  return callback(null, ramp);
};
