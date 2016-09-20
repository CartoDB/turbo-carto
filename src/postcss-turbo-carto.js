'use strict';

require('es6-promise').polyfill();

var valueParser = require('postcss-value-parser');
var postcss = require('postcss');
var FnBuilder = require('./fn/builder');

function PostcssTurboCarto (datasource) {
  this.datasource = datasource;
}

module.exports = PostcssTurboCarto;

PostcssTurboCarto.prototype.getPlugin = function (metadataHolder) {
  var self = this;
  return postcss.plugin('turbo-carto', function (/* opts */) {
    return function (css /* , result */) {
      var fnBuilder = new FnBuilder(self.datasource);

      css.walkDecls(function (decl) {
        var parsedValue = valueParser(decl.value);
        parsedValue.walk(function (node) {
          if (node.type === 'function') {
            fnBuilder.add(decl, node, metadataHolder);
            return false;
          }
        }, false);
      });

      return fnBuilder.exec();
    };
  });
};
