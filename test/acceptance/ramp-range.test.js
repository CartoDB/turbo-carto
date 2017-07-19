'use strict';

var assert = require('assert');
var turbocarto = require('../../src/index');
var DummyDatasource = require('../support/dummy-datasource');

describe('range issue', function () {
  it('should generate a valid cartocss for a ramp with only one bucket/value and ">" strategy', function (done) {
    var turboCartocss = [
      '#layer{',
      '  marker-fill: ramp([cartodb_id], cartocolor(SunsetDark, 10), jenks);',
      '}'
    ].join('\n');
    var expectedCartocss = [
      '#layer{',
      '  marker-fill: #fcde9c;',
      '}'
    ].join('\n');
    var datasource = new DummyDatasource(function () {
      return {
        ramp: [5],
        stats: { min_val: 5, max_val: 5, avg_val: 5 }
      };
    });
    turbocarto(turboCartocss, datasource, function (err, result) {
      if (err) {
        return done(err);
      }

      assert.equal(result, expectedCartocss);
      done();
    });
  });

  it('should generate a valid cartocss for a ramp with only one bucket/value and "<" strategy', function (done) {
    var turboCartocss = [
      '#layer{',
      '  marker-fill: ramp([cartodb_id], cartocolor(SunsetDark, 10), headtails(1));',
      '}'
    ].join('\n');
    var expectedCartocss = [
      '#layer{',
      '  marker-fill: #7c1d6f;',
      '}'
    ].join('\n');
    var datasource = new DummyDatasource(function () {
      return {
        ramp: [1],
        stats: { min_val: 1, max_val: 1, avg_val: 1 }
      };
    });
    turbocarto(turboCartocss, datasource, function (err, result) {
      if (err) {
        return done(err);
      }

      assert.equal(result, expectedCartocss);
      done();
    });
  });
});
