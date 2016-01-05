'use strict';

var debug = require('debug');
module.exports = function turboCartoCssDebug (ns) {
  return debug(['turbo-cartocss', ns].join(':'));
};
