'use strict';

var assert = require('assert');
var turbocarto = require('../../src/index');
var DummyDatasource = require('../support/dummy-datasource');

/*
with num_buckets AS (
  select 4 as count
),
agg AS (
  select
  array_agg(r4) as arr1,
  array_agg(r1) as arr2,
  array_agg(r2) as arr3,
  array_agg(r3) as arr4
from
generate_series(0, 10) as r1,
  generate_series(0, 10, 4) as r2,
  generate_series(0, 10, 2.5) as r3,
  generate_series(0, 100) as r4
),
ramps as (
  select
  CDB_EqualIntervalBins(arr3, count)::int[] as equal,
  CDB_HeadsTailsBins(arr4, count)::int[] as headtails,
  CDB_JenksBins(arr4, count)::int[] as jenks,
  CDB_QuantileBins(arr2, count)::int[] as quantiles
FROM agg, num_buckets
)
select row_to_json(ramps) from ramps
*/
var ramps = {
  equal: [ 2, 4, 6, 8 ],
  headtails: [ 50, 76, 88, 95 ],
  jenks: [ 3, 5, 8, 10 ],
  quantiles: [ 2, 5, 8, 10 ]
};

var datasource = new DummyDatasource(function (column, buckets, method) {
  return ramps[method];
});

describe('ramp-buckets', function () {
  function createCartocss (fn, mapping) {
    return [
      '#layer{',
      '  marker-width: ramp([pop], (10, 20, 30, 40), ' + fn + '' + (mapping ? (', ' + mapping) : '') + ')',
      '}'
    ].join('\n');
  }

  var scenarios = [
    {
      desc: 'equal uses >',
      quantification: 'equal',
      expectedCartocss: function (mapping) {
        mapping = mapping || '>';
        return [
          '#layer{',
          '  marker-width: 10;',
          '  [ pop ' + mapping + ' 2 ]{',
          '    marker-width: 20',
          '  }',
          '  [ pop ' + mapping + ' 4 ]{',
          '    marker-width: 30',
          '  }',
          '  [ pop ' + mapping + ' 6 ]{',
          '    marker-width: 40',
          '  }',
          '}'
        ].join('\n');
      }
    },
    {
      desc: 'headtails uses <',
      quantification: 'headtails',
      expectedCartocss: function (mapping) {
        mapping = mapping || '<';
        return [
          '#layer{',
          '  marker-width: 40;',
          '  [ pop ' + mapping + ' 95 ]{',
          '    marker-width: 30',
          '  }',
          '  [ pop ' + mapping + ' 88 ]{',
          '    marker-width: 20',
          '  }',
          '  [ pop ' + mapping + ' 76 ]{',
          '    marker-width: 10',
          '  }',
          '}'
        ].join('\n');
      }
    },
    {
      desc: 'jenks uses >',
      quantification: 'jenks',
      expectedCartocss: function (mapping) {
        mapping = mapping || '>';
        return [
          '#layer{',
          '  marker-width: 10;',
          '  [ pop ' + mapping + ' 3 ]{',
          '    marker-width: 20',
          '  }',
          '  [ pop ' + mapping + ' 5 ]{',
          '    marker-width: 30',
          '  }',
          '  [ pop ' + mapping + ' 8 ]{',
          '    marker-width: 40',
          '  }',
          '}'
        ].join('\n');
      }
    },
    {
      desc: 'quantiles uses >',
      quantification: 'quantiles',
      expectedCartocss: function (mapping) {
        mapping = mapping || '>';
        return [
          '#layer{',
          '  marker-width: 10;',
          '  [ pop ' + mapping + ' 2 ]{',
          '    marker-width: 20',
          '  }',
          '  [ pop ' + mapping + ' 5 ]{',
          '    marker-width: 30',
          '  }',
          '  [ pop ' + mapping + ' 8 ]{',
          '    marker-width: 40',
          '  }',
          '}'
        ].join('\n');
      }
    }
  ];

  scenarios.forEach(function (scenario) {
    var itFn = scenario.only ? it.only : it;
    if (scenario.quantification === 'headtails') {
      // headtails, and in general any less_than[_or_equal], has change the behaviour for the default value
      // using the last value as default, where before the first value was the default one.
      // So it doesn't make sense to validate it produces the same output.
      return;
    }
    itFn(scenario.desc, function (done) {
      turbocarto(createCartocss(scenario.quantification), datasource, function (err, cartocssResult) {
        if (err) {
          return done(err);
        }
        assert.strictEqual(cartocssResult, scenario.expectedCartocss());
        done();
      });
    });
  });

  scenarios.forEach(function (scenario) {
    var itFn = scenario.only ? it.only : it;
    itFn(scenario.desc + ' with fn() call', function (done) {
      turbocarto(createCartocss(scenario.quantification + '(4)'), datasource, function (err, cartocssResult) {
        if (err) {
          return done(err);
        }
        assert.strictEqual(cartocssResult, scenario.expectedCartocss());
        done();
      });
    });
  });

  scenarios.forEach(function (scenario) {
    var itFn = scenario.only ? it.only : it;
    var mapping = '>=';
    if (scenario.quantification === 'headtails') {
      mapping = '<=';
    }
    itFn(scenario.desc + ' with fn() call, overwritten with ' + mapping, function (done) {
      turbocarto(createCartocss(scenario.quantification + '(4)', mapping), datasource, function (err, cartocssResult) {
        if (err) {
          return done(err);
        }
        assert.strictEqual(cartocssResult, scenario.expectedCartocss(mapping));
        done();
      });
    });
  });
});
