'use strict';

var assert = require('assert');
var geojsonSample = require('../../../examples/geojson-source');
var GeojsonDatasource = require('../../../src/datasource/geojson-datasource');

describe('geojson-datasource', function () {
  it('getRamp', function () {
    this.geojsonDatasource = new GeojsonDatasource(geojsonSample);

    this.geojsonDatasource.getRamp('pop_max', 'quantiles', function (err, quantiles) {
      assert.ifError(err);
      assert.deepEqual(quantiles, [ 17869, 35819, 67762, 189338, 2184000 ]);
    });
  });
});
