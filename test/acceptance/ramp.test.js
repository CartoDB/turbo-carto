'use strict';

var fs = require('fs');
var assert = require('assert');
var turbocarto = require('../../src/index');
var DummyDatasource = require('../support/dummy-datasource');

var datasource = new DummyDatasource();

var scenariosPath = __dirname + '/scenarios';
var scenarios = fs.readdirSync(scenariosPath)
  .filter(function (filename) {
    return filename.match(/.css$/) &&
      !filename.match(/expected.css$/) &&
      !filename.match(/^skip/);
  })
  .map(function (cssFilename) {
    var desc = cssFilename.replace(/\.css$/, '').replace(/-/g, ' ');
    var cartocssFilePath = scenariosPath + '/' + cssFilename;
    var expectedCartocssFilePath = scenariosPath + '/' + cssFilename.replace(/css$/, 'expected.css');

    return {
      desc: desc,
      cartocss: fs.readFileSync(cartocssFilePath, {encoding: 'utf-8'}),
      expectedCartocss: fs.readFileSync(expectedCartocssFilePath, {encoding: 'utf-8'})
    };
  });

describe('ramp', function () {
  scenarios.forEach(function (scenario) {
    it(scenario.desc, function (done) {
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
