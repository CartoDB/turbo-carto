'use strict';

var postcss = require('postcss');
var FnFactory = require('./fn/fn-abstract-factory');
var SqlApiDatasource = require('./backend/sql-api-datasource');
var PostcssTurboCartoCss = require('./postcss-turbo-cartocss');

function turbocartocss (cartocss, query, callback) {
  FnFactory.setDatasource(new SqlApiDatasource(query));
  postcss([PostcssTurboCartoCss])
    .process(cartocss)
    .then(function (result) {
      callback(null, result.css);
    })
    .catch(callback);
}

module.exports = turbocartocss;
