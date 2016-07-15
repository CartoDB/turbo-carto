'use strict';

var assert = require('assert');
var postcss = require('postcss');
var PostcssTurboCarto = require('../../src/postcss-turbo-carto');
var DummyDatasource = require('../support/dummy-datasource');
var DummyStrategyDatasource = require('../support/dummy-strategy-datasource');

var dummyDatasource = new DummyDatasource();
var maxStrategyDatasource = new DummyStrategyDatasource('max');
var splitStrategyDatasource = new DummyStrategyDatasource('split');
var exactStrategyDatasource = new DummyStrategyDatasource('exact', function alphabetRamp (buckets) {
  var ramp = [];
  var start = 'a'.charCodeAt(0);
  for (var i = 0; i < buckets; i++) {
    ramp.push(String.fromCharCode(start + i));
  }
  return ramp;
});
var numericExactStrategyDatasource = new DummyStrategyDatasource('exact');

describe('ramp-strategy', function () {
  function getCartoCss (datasource, cartocss, callback) {
    var postcssTurboCarto = new PostcssTurboCarto(datasource);
    postcss([postcssTurboCarto.getPlugin()])
      .process(cartocss)
      .then(function (result) {
        return callback(null, result.css);
      })
      .catch(function (err) {
        return callback(err);
      });
  }

  var cartocss = [
    '#layer{',
    '  marker-width: ramp([population], 10, 50, 5);',
    '}'
  ].join('\n');

  var generalExpectedCartocss = [
    '#layer{',
    '  marker-width: 10;',
    '  [ population > 0 ]{',
    '    marker-width: 20',
    '  }',
    '  [ population > 1 ]{',
    '    marker-width: 30',
    '  }',
    '  [ population > 2 ]{',
    '    marker-width: 40',
    '  }',
    '  [ population > 3 ]{',
    '    marker-width: 50',
    '  }',
    '}'
  ].join('\n');

  var scenarios = [
    {
      desc: 'dummy datasource returning arrays keeps working',
      datasource: dummyDatasource,
      expectedCartocss: generalExpectedCartocss
    },
    {
      desc: 'result with max strategy produces the same cartocss as before',
      datasource: maxStrategyDatasource,
      expectedCartocss: generalExpectedCartocss
    },
    {
      desc: 'result with split strategy generates different cartocss',
      datasource: splitStrategyDatasource,
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '  [ population > 1 ]{',
        '    marker-width: 20',
        '  }',
        '  [ population > 2 ]{',
        '    marker-width: 30',
        '  }',
        '  [ population > 3 ]{',
        '    marker-width: 40',
        '  }',
        '  [ population > 4 ]{',
        '    marker-width: 50',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'result with exact strategy generates different cartocss',
      datasource: exactStrategyDatasource,
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '  [ population = "b" ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = "c" ]{',
        '    marker-width: 30',
        '  }',
        '  [ population = "d" ]{',
        '    marker-width: 40',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'result with exact strategy generates uses numeric values',
      datasource: numericExactStrategyDatasource,
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '  [ population = 1 ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = 2 ]{',
        '    marker-width: 30',
        '  }',
        '  [ population = 3 ]{',
        '    marker-width: 40',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'result with exact strategy is generated from buckets fn',
      datasource: numericExactStrategyDatasource,
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], range(10, 50), buckets([population], category));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '  [ population = 1 ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = 2 ]{',
        '    marker-width: 30',
        '  }',
        '  [ population = 3 ]{',
        '    marker-width: 40',
        '  }',
        '  [ population = 4 ]{',
        '    marker-width: 50',
        '  }',
        '}'
      ].join('\n')
    },
    {
      desc: 'result with exact strategy is generated from buckets fn, force number of buckets',
      datasource: numericExactStrategyDatasource,
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], range(10, 40), buckets([population], category, 4));',
        '}'
      ].join('\n'),
      expectedCartocss: [
        '#layer{',
        '  marker-width: 10;',
        '  [ population = 1 ]{',
        '    marker-width: 20',
        '  }',
        '  [ population = 2 ]{',
        '    marker-width: 30',
        '  }',
        '  [ population = 3 ]{',
        '    marker-width: 40',
        '  }',
        '}'
      ].join('\n')
    }
  ];

  scenarios.forEach(function (scenario) {
    it(scenario.desc, function (done) {
      getCartoCss(scenario.datasource, scenario.cartocss || cartocss, function (err, cartocssResult) {
        if (err) {
          return done(err);
        }
        assert.equal(cartocssResult, scenario.expectedCartocss);
        done();
      });
    });
  });
});
