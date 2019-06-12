'use strict';

var assert = require('assert');
var turbocarto = require('../../src/index');
var DummyDatasource = require('../support/dummy-datasource');
var DummyStrategyDatasource = require('../support/dummy-strategy-datasource');

describe('regressions', function () {
  var scenarios = [
    {
      desc: 'should keep working with category quantification',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40), (Spain, Portugal, France), category);',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 40;',
        '  [ population = "Spain" ]{',
        '    marker-width: 10',
        '  }',
        '  [ population = "Portugal" ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = "France" ]{',
        '    marker-width: 30',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'will not use default value when exact number of values and filters is provided',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30), (Spain, Portugal, France), category);',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  [ population = "Spain" ]{',
        '    marker-width: 10',
        '  }',
        '  [ population = "Portugal" ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = "France" ]{',
        '    marker-width: 30',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'should use strings for filters',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40), (Spain, Portugal, France), category);',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 40;',
        '  [ population = "Spain" ]{',
        '    marker-width: 10',
        '  }',
        '  [ population = "Portugal" ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = "France" ]{',
        '    marker-width: 30',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'should work with escaped strings',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40), ("Spain\'s", Portugal, France), category);',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 40;',
        '  [ population = "Spain\'s" ]{',
        '    marker-width: 10',
        '  }',
        '  [ population = "Portugal" ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = "France" ]{',
        '    marker-width: 30',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'should work with empty results and split strategy',
      datasource: new DummyStrategyDatasource('split', function () {
        return [];
      }),
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '}'
      ].join('\n')
    },
    {
      desc: 'should work with empty results and exact strategy',
      datasource: new DummyStrategyDatasource('exact', function () {
        return [];
      }),
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '}'
      ].join('\n')
    },
    {
      desc: 'should work with empty results and exact strategy and marker-fill',
      datasource: new DummyStrategyDatasource('exact', function () {
        return [];
      }),
      cartocss: [
        '#layer{',
        '  marker-fill: ramp([population], colorbrewer(Reds));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-fill: #fee5d9;',
        '}'
      ].join('\n')
    },
    {
      desc: 'should work when result provides less values than tuples',
      datasource: new DummyStrategyDatasource('exact', function () {
        return [1, 2];
      }),
      cartocss: [
        '#layer{',
        '  marker-fill: ramp([population], colorbrewer(Reds, 7));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-fill: #fee5d9;',
        '  [ population = 2 ]{',
        '    marker-fill: #fcbba1',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'should work with less values than filters',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (8, 24, 96), (8, 24, 96, 128));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 8;',
        '  [ population > 8 ]{',
        '    marker-width: 24',
        '  }',
        '  [ population > 24 ]{',
        '    marker-width: 96',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'should work with old string categories style',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (8, 24, 96), ("WADUS", "FOO", "BAR"));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  [ population = "WADUS" ]{',
        '    marker-width: 8',
        '  }',
        '  [ population = "FOO" ]{',
        '    marker-width: 24',
        '  }',
        '  [ population = "BAR" ]{',
        '    marker-width: 96',
        '  }',
        '}'
      ].join('\n')
    }
  ];

  scenarios.forEach(function (scenario) {
    var itFn = scenario.only ? it.only : it;
    itFn(scenario.desc, function (done) {
      var datasource = scenario.datasource || new DummyDatasource();
      turbocarto(scenario.cartocss, datasource, function (err, cartocssResult) {
        if (err) {
          return done(err);
        }
        assert.strictEqual(cartocssResult, scenario.expectedCartocss);
        done();
      });
    });
  });

  it('should return an error if it receives an evil ramp (instead of unhandled exception)', function (done) {
    // NOTE the missing first param (the column) in the ramp
    var cartocss = [
      '#layercat{',
      '  marker-width: ramp(, cartocolor(Safe), category(3));',
      '}'
    ].join('\n');
    var headtailsDatasource = new DummyDatasource(function () {
      return {
        ramp: [
          'United States of America',
          'Russia',
          'China'
        ],
        strategy: 'exact',
        stats: { min_val: undefined, max_val: undefined, avg_val: undefined } };
    });
    turbocarto(cartocss, headtailsDatasource, function (err /*, result, metadata */) {
      if (err) {
        // We're expecting this error
        assert.strictEqual(err.name, 'TurboCartoError');
        assert.strictEqual(err.message, 'Failed to process "marker-width" property: column.replace is not a function');
        done();
      }
    });
  });
});
