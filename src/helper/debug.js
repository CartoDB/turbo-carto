'use strict';

var debug = require('debug');
module.exports = function turboCartoDebug (ns) {
  return debug(['turbo-carto', ns].join(':'));
};
