'use strict';

function DummyDatasource () {
}

module.exports = DummyDatasource;

DummyDatasource.prototype.getName = function () {
  return 'DummyDatasource';
};

DummyDatasource.prototype.getRamp = function (column, buckets, method, callback) {
  var ramp = [];
  for (var i = 0; i < buckets; i++) {
    ramp.push(i);
  }
  return callback(null, ramp);
};
