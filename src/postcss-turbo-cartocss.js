'use strict';

require('es6-promise').polyfill();

var valueParser = require('postcss-value-parser');
var postcss = require('postcss');
var FnBuilder = require('./fn/fn-builder');

function PostcssTurboCartoCss (datasource) {
  this.datasource = datasource;
}

module.exports = PostcssTurboCartoCss;

PostcssTurboCartoCss.prototype.getPlugin = function () {
  var self = this;
  return postcss.plugin('turbo-cartocss', function ( /* opts */) {
    return function (css /* , result */) {
      var fnBuilder = new FnBuilder(self.datasource);

      css.walkDecls(function (decl) {
        var parsedValue = valueParser(decl.value);
        parsedValue.walk(function (node) {
          if (node.type === 'function') {
            fnBuilder.add(decl, node);
            return false;
          }
        }, false);
      });

      return fnBuilder.exec()
        .then(function (results) {
          results.forEach(function (result) {
            var decl = result.decl;
            var parent = decl.parent;

            var bucketsResult = result.result;
            parent.append(postcss.decl({prop: decl.prop, value: bucketsResult.start}));
            var ramp = bucketsResult.ramp.reverse();
            for (var i = 0; i < ramp.length; i += 2) {
              var rule = postcss.rule({
                selector: '[ ' + bucketsResult.column + ' < ' + ramp[i + 1] + ' ]'
              });
              rule.append(postcss.decl({prop: decl.prop, value: ramp[i]}));
              parent.append(rule);
            }

            decl.remove();
          });
        });
    };
  });
};
