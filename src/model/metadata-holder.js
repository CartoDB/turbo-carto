'use strict';

function MetadataHolder () {
  this.rules = [];
}

module.exports = MetadataHolder;

MetadataHolder.prototype.add = function (rule) {
  this.rules.push(rule);
};
