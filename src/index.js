'use strict';

var postcss = require('postcss');
var PostcssTurboCarto = require('./postcss-turbo-carto');

function turbocarto (cartocss, datasource, callback) {
  var postCssTurboCarto = new PostcssTurboCarto(datasource);

  postcss([postCssTurboCarto.getPlugin()])
    .process(cartocss)
    .then(function (result) {
      callback(null, result.css);
    })
    .catch(callback);
}

module.exports = turbocarto;
