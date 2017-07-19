'use strict';

var assert = require('assert');
var turbocarto = require('../../src/index');
var DummyDatasource = require('../support/dummy-datasource');

describe('range issue', function () {
  it('should generate a valid cartocss for blah blah', function (done) {
    var turboCartocss = [
      '#layer{',
      '  marker-width: ramp([cartodb_id], cartocolor(SunsetDark, 10), jenks);',
      '}'
    ].join('\n');
    var expectedCartocss = [
      '#layer{',
      '  marker-width: #fcde9c;',
      '}'
    ].join('\n');
    var datasource = new DummyDatasource(function () {
        return {
            ramp: [ 5 ],
            stats: { min_val: 5, max_val: 5, avg_val: 5 }
        };
    });
    turbocarto(turboCartocss, datasource, function (err, result, metadata) {
      if (err) {
        return done(err);
      }

      assert.equal(result, expectedCartocss);
      done();
    });
  });
});
