'use strict';

var assert = require('assert');
var turbocarto = require('../../src/index');
var DummyDatasource = require('../support/dummy-datasource');

describe('conditional ramp-buckets', function () {
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

  scenarios.forEach(function (scenario) {
    it('should generate a valid cartocss for a ramp with only one bucket/value and ' + scenario.desc, function (done) {
      turbocarto(scenario.turboCartocss, scenario.datasource, function (err, result) {
        if (err) {
          return done(err);
        }

        assert.strictEqual(result, scenario.expectedCartocss);
        done();
      });
    });
  });
});

describe('Buckets calculation', function () {
  function createCartoCSS (numBuckets) {
    return [
      '#layer {',
      '  marker-width: ramp([population], range(1, 100), quantiles(' + numBuckets + '));',
      '  marker-fill: #EE4D5A;\n  marker-fill-opacity: 0.9;\n',
      '  marker-allow-overlap: true; \n  marker-line-width: 1; \n',
      '  marker-line-color: #FFFFFF; \n  marker-line-opacity: 1; \n',
      '}'
    ].join('\n');
  }

  var scenarios = [
    {
      desc: 'Buckets: 1',
      numBuckets: 1,
      dataSourceStats: { min_val: 1, max_val: 100, avg_val: 50 },
      ramp: [1],
      expectedBuckets: [
        {
          'filter': {
            'type': 'range',
            'start': 1,
            'end': 100
          },
          'value': 1
        }
      ],
      expectedStats: {
        filter_avg: 50
      }
    },
    {
      desc: 'Buckets: 2',
      numBuckets: 2,
      dataSourceStats: { min_val: 1, max_val: 100, avg_val: 50 },
      ramp: [1, 2],
      expectedBuckets: [
        {
          'filter': {
            'type': 'range',
            'start': 1,
            'end': 1
          },
          'value': 1
        },
        {
          'filter': {
            'type': 'range',
            'start': 1,
            'end': 100
          },
          'value': 100
        }
      ],
      expectedStats: {
        filter_avg: 50
      }
    },
    {
      desc: 'Buckets: 3',
      numBuckets: 3,
      dataSourceStats: { min_val: 1, max_val: 100, avg_val: 50 },
      ramp: [1, 2, 3],
      expectedBuckets: [
        {
          'filter': {
            'type': 'range',
            'start': 1,
            'end': 1
          },
          'value': 1
        },
        {
          'filter': {
            'type': 'range',
            'start': 1,
            'end': 2
          },
          'value': 50.5
        },
        {
          'filter': {
            'type': 'range',
            'start': 2,
            'end': 100
          },
          'value': 100
        }
      ],
      expectedStats: {
        filter_avg: 50
      }
    }
  ];

  scenarios.forEach(function (scenario) {
    it(scenario.desc, function (done) {
      var datasource = new DummyDatasource(function () {
        return {
          ramp: scenario.ramp,
          strategy: '>',
          stats: scenario.dataSourceStats
        };
      });

      var cartocss = createCartoCSS(scenario.numBuckets);

      turbocarto(cartocss, datasource, function (err, result, metadata) {
        assert.ifError(err);

        assert.strictEqual(metadata.rules[0].buckets.length, scenario.numBuckets);
        assert.deepStrictEqual(metadata.rules[0].buckets, scenario.expectedBuckets);
        done();
      });
    });
  });
});
