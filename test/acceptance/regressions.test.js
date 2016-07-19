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
        '  marker-width: ramp([population], (10, 20, 30, 40), (_, Spain, Portugal, France), category);',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '  [ population = "Spain" ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = "Portugal" ]{',
        '    marker-width: 30',
        '  }',
        '  [ population = "France" ]{',
        '    marker-width: 40',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'should use strings for filters',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40), (_, Spain, Portugal, France), category);',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '  [ population = "Spain" ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = "Portugal" ]{',
        '    marker-width: 30',
        '  }',
        '  [ population = "France" ]{',
        '    marker-width: 40',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'should work with escaped strings',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40), (_, "Spain\'s", Portugal, France), category);',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '  [ population = "Spain\'s" ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = "Portugal" ]{',
        '    marker-width: 30',
        '  }',
        '  [ population = "France" ]{',
        '    marker-width: 40',
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
        '  [ population > 24 ]{',
        '    marker-width: 24',
        '  }',
        '  [ population > 96 ]{',
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
        assert.equal(cartocssResult, scenario.expectedCartocss);
        done();
      });
    });
  });
});
