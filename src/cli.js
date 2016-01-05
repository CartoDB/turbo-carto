'use strict';

var argv = require('yargs').argv;

var postcss = require('postcss');
var cartocss = require('./cartocss');

var FnFactory = require('./fn/fn-abstract-factory');
var SqlApiDatasource = require('./backend/sql-api-datasource');

var datasource = argv.datasource || 'dummy';
if (datasource === 'sql') {
  if (!argv.query) {
    console.error('sql datasource requires --query param');
    process.exit(1);
  }
  FnFactory.setDatasource(new SqlApiDatasource(argv.query));
}

postcss([require('./postcss-turbo-cartocss')])
  .process(cartocss)
  .then(function (result) {
    console.log(result.css);
  })
  .catch(function (err) {
    console.error(err);
  });

  // var TurboCartoCss = require('./turbo-cartocss');
  // var turboCartoCss = new TurboCartoCss();
  //
  // postcss([turboCartoCss.postcssPlugin])
  //    .process(cartocss)
  //    .then(function(result) {
  //        console.log(result.css);
  //    })
  //    .catch(console.log);
