'use strict';

var quantile = require('turf-quantile');

function GeojsonDatasource (geojsonSample) {
  this.source = geojsonSample;
}

GeojsonDatasource.prototype.getName = function () {
  return 'GeojsonDatasource';
};

GeojsonDatasource.prototype.quantiles = function (column) {
  return quantile(this.source, column, [20, 40, 60, 80, 100]);
};

GeojsonDatasource.prototype.getRamp = function (column, method, callback) {
  try {
    callback(null, this[method](column));
  } catch (err) {
    callback(err);
  }
};

module.exports = GeojsonDatasource;
