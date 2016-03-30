'use strict';

var assert = require('assert');
var geojsonSample = require('../../../examples/geojson-source');
var GeojsonDatasource = require('../../../src/datasource/geojson-datasource');

describe('geojson-datasource', function () {
  it('getRamp for quantiles', function () {
    this.geojsonDatasource = new GeojsonDatasource(geojsonSample);

    this.geojsonDatasource.getRamp('pop_max', 'quantiles', function (err, quantiles) {
      assert.ifError(err);
      assert.deepEqual(quantiles, [ 17869, 35819, 67762, 189338, 2184000 ]);
    });
  });

  it('getRamp for jenks', function () {
    this.geojsonDatasource = new GeojsonDatasource(geojsonSample);

    this.geojsonDatasource.getRamp('pop_max', 'jenks', function (err, jenks) {
      assert.ifError(err);
      assert.deepEqual(jenks, [ 10, 140437, 381116, 837000, 2151000, 2184000 ]);
    });
  });
});
