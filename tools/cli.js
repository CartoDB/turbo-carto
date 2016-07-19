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

var turbocarto = require('../src/index');
var SqlApiDatasource = require('../examples/sql-api-datasource');

// stubbed datasource
var datasource = {
  getName: function () {
    return 'StubDatasource';
  },

  getRamp: function (column, buckets, method, callback) {
    if (method === 'category') {
      return callback(null, ['Private Room', 'Entire House', 'Other', 'Complete floor'].slice(0, buckets));
    }
    return callback(null, [100000, 250000, 500000, 1e6, 1.5e6, 2e6, 1e7].slice(0, buckets));
  }
};

if (argv.datasource === 'sql') {
  if (!argv.query) {
    console.error('sql datasource requires --query param');
    process.exit(1);
  }
  datasource = new SqlApiDatasource(argv.query);
}

turbocarto(cartocss, datasource, function (err, result) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(result);
});
