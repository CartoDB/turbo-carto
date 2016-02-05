'use strict';

function DummyDatasource () {
}

module.exports = DummyDatasource;

DummyDatasource.prototype.getName = function () {
  return 'DummyDatasource';
};

DummyDatasource.prototype.getRamp = function (column, scheme, callback) {
  return callback(null, [100000, 250000, 500000, 1e6, 1.5e6, 2e6, 1e7]);
};
