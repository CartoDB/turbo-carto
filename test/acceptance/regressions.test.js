'use strict';

var assert = require('assert');
var postcss = require('postcss');
var PostcssTurboCarto = require('../../src/postcss-turbo-carto');
var DummyDatasource = require('../support/dummy-datasource');

describe('regressions', function () {
  function getCartoCss (cartocss, callback) {
    var postcssTurboCarto = new PostcssTurboCarto(new DummyDatasource());
    postcss([postcssTurboCarto.getPlugin()])
      .process(cartocss)
      .then(function (result) {
        return callback(null, result.css);
      })
      .catch(function (err) {
        return callback(err);
      });
  }

  var scenarios = [
    {
      desc: 'should use strings for filters',
      cartocss: [
        '#layer{',
        '  marker-width: ramp([population], (10, 20, 30, 40), (_, Spain, Portugal, France));',
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
        '  marker-width: ramp([population], (10, 20, 30, 40), (_, "Spain\'s", Portugal, France));',
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
    }
  ];

  scenarios.forEach(function (scenario) {
    it(scenario.desc, function (done) {
      getCartoCss(scenario.cartocss, function (err, cartocssResult) {
        if (err) {
          return done(err);
        }
        assert.equal(cartocssResult, scenario.expectedCartocss);
        done();
      });
    });
  });
});
