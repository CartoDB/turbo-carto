'use strict';

var postcss = require('postcss');
var PostcssTurboCartoCss = require('./postcss-turbo-cartocss');

function turbocartocss (cartocss, datasource, callback) {
  var postCssTurboCartoCss = new PostcssTurboCartoCss(datasource);

  postcss([postCssTurboCartoCss.getPlugin()])
    .process(cartocss)
    .then(function (result) {
      callback(null, result.css);
    })
    .catch(callback);
}

module.exports = turbocartocss;
module.exports.datasource = require('./datasource');
