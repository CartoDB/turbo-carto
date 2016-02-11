#!/usr/bin/env node

'use strict';

var fs = require('fs');
var argv = require('yargs').argv;

var filename = argv._[0];
if (!filename) {
  console.error('Must specify a css file');
  process.exit(1);
}
if (!fs.existsSync(filename)) {
  console.error('File "%s" does not exist', filename);
  process.exit(1);
}
var cartocss = fs.readFileSync(filename, {encoding: 'utf-8'});

var postcss = require('postcss');
var PostcssTurboCartoCss = require('../src/postcss-turbo-cartocss');
var SqlApiDatasource = require('../src/datasource/sql-api-datasource');
var GeojsonDatasource = require('../src/datasource').Geojson;

// stubbed datasource
var datasource = {
  getName: function () {
    return 'StubDatasource';
  },

  getRamp: function (column, scheme, callback) {
    return callback(null, [100000, 250000, 500000, 1e6, 1.5e6, 2e6, 1e7]);
  }
};

if (argv.datasource === 'sql') {
  if (!argv.query) {
    console.error('sql datasource requires --query param');
    process.exit(1);
  }
  datasource = new SqlApiDatasource(argv.query);
}

if (argv.datasource === 'geojson') {
  if (!argv.file) {
    console.error('geojson datasource requires --file (relative path) param');
    process.exit(1);
  }

  var geojsonPath = argv.file;

  if (!fs.existsSync(geojsonPath)) {
    console.error('File "%s" does not exist', geojsonPath);
    process.exit(1);
  }

  var geojsonRaw = fs.readFileSync(geojsonPath, {encoding: 'utf-8'});
  var geojson;

  try {
    geojson = JSON.parse(geojsonRaw);
  } catch (err) {
    console.error('Error parsing geojson', err);
    process.exit(1);
  }

  datasource = new GeojsonDatasource(geojson);
}

var postCssTurboCartoCss = new PostcssTurboCartoCss(datasource);
postcss([postCssTurboCartoCss.getPlugin()])
  .process(cartocss)
  .then(function (result) {
    console.log(result.css);
  })
  .catch(function (err) {
    console.error(err);
  });
