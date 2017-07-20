'use strict';

var assert = require('assert');
var turbocarto = require('../../src/index');
var DummyDatasource = require('../support/dummy-datasource');

var scenarios = [
  {
    desc: '">" strategy',
    datasource: new DummyDatasource(function () {
      return [1];
    }),
    turboCartocss: [
      '#layer{',
      '  marker-fill: ramp([cartodb_id], cartocolor(SunsetDark, 10), jenks);',
      '}'
    ].join('\n'),
    expectedCartocss: [
      '#layer{',
      '  marker-fill: #fcde9c;',
      '}'
    ].join('\n')
  },
  {
    desc: '"<" strategy',
    datasource: new DummyDatasource(function () {
      return [1];
    }),
    turboCartocss: [
      '#layer{',
      '  marker-fill: ramp([cartodb_id], cartocolor(SunsetDark, 10), headtails(1));',
      '}'
    ].join('\n'),
    expectedCartocss: [
      '#layer{',
      '  marker-fill: #7c1d6f;',
      '}'
    ].join('\n')
  }
];

describe('conditional ramp-buckets', function () {
  scenarios.forEach(function (scenario) {
    it('should generate a valid cartocss for a ramp with only one bucket/value and ' + scenario.desc, function (done) {
      turbocarto(scenario.turboCartocss, scenario.datasource, function (err, result) {
        if (err) {
          return done(err);
        }

        assert.equal(result, scenario.expectedCartocss);
        done();
      });
    });
  });
});
