'use strict';

var assert = require('assert');
var postcss = require('postcss');
var PostcssTurboCarto = require('../../src/postcss-turbo-carto');
var DummyDatasource = require('../support/dummy-datasource');

var datasource = new DummyDatasource();

var postcssTurboCarto = new PostcssTurboCarto(datasource);

describe('color-ramp', function () {
  var cartocss = [
    '#layer{',
    '  polygon-opacity: 1;',
    '  polygon-fill: ramp([area2], colorbrewer(YlGnBu, 7), jenks);',
    '}'
  ].join('\n');

  var expectedCartocss = [
    '#layer{',
    '  polygon-opacity: 1;',
    '  polygon-fill: #ffffcc;',
    '  [ area2 > 0 ]{',
    '    polygon-fill: #c7e9b4',
    '  }',
    '  [ area2 > 1 ]{',
    '    polygon-fill: #7fcdbb',
    '  }',
    '  [ area2 > 2 ]{',
    '    polygon-fill: #41b6c4',
    '  }',
    '  [ area2 > 3 ]{',
    '    polygon-fill: #1d91c0',
    '  }',
    '  [ area2 > 4 ]{',
    '    polygon-fill: #225ea8',
    '  }',
    '  [ area2 > 5 ]{',
    '    polygon-fill: #0c2c84',
    '  }',
    '}'
  ].join('\n');

  it('should return a rule selector with color ramp', function (done) {
    postcss([postcssTurboCarto.getPlugin()])
      .process(cartocss)
      .then(function (result) {
        assert.equal(result.css, expectedCartocss);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('should use array', function (done) {
    var cartocss = [
      '#layer{',
      '  polygon-opacity: 1;',
      '  polygon-fill: ramp([area2], (Red, Green, Blue), jenks);',
      '}'
    ].join('\n');

    var expectedCartocss = [
      '#layer{',
      '  polygon-opacity: 1;',
      '  polygon-fill: Red;',
      '  [ area2 > 0 ]{',
      '    polygon-fill: Green',
      '  }',
      '  [ area2 > 1 ]{',
      '    polygon-fill: Blue',
      '  }',
      '}'
    ].join('\n');

    postcss([postcssTurboCarto.getPlugin()])
      .process(cartocss)
      .then(function (result) {
        assert.equal(result.css, expectedCartocss);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('should work with numeric ramps', function (done) {
    var cartocss = [
      '#layer{',
      '  marker-width: ramp([population], (4, 8, 12), jenks);',
      '}'
    ].join('\n');

    var expectedCartocss = [
      '#layer{',
      '  marker-width: 4;',
      '  [ population > 0 ]{',
      '    marker-width: 8',
      '  }',
      '  [ population > 1 ]{',
      '    marker-width: 12',
      '  }',
      '}'
    ].join('\n');

    postcss([postcssTurboCarto.getPlugin()])
      .process(cartocss)
      .then(function (result) {
        assert.equal(result.css, expectedCartocss);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
});
