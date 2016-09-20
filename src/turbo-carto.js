'use strict';

var postcss = require('postcss');
var PostcssTurboCarto = require('./postcss-turbo-carto');
var MetadataHolder = require('./model/metadata-holder');

function TurboCarto (cartocss, datasource) {
  this.cartocss = cartocss;
  this.datasource = datasource;
  this.metadataHolder = new MetadataHolder();
}

TurboCarto.prototype.getCartocss = function (callback) {
  var self = this;

  var postCssTurboCarto = new PostcssTurboCarto(this.datasource);

  postcss([postCssTurboCarto.getPlugin(this.metadataHolder)])
    .process(this.cartocss)
    .then(function (result) {
      callback(null, result.css, self.metadataHolder);
    })
    .catch(callback);
};

TurboCarto.prototype.getMetadata = function (callback) {
  return callback(null, this.metadataHolder);
};

module.exports = TurboCarto;
