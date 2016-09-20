'use strict';

var TurboCarto = require('./turbo-carto');

function turbocarto (cartocss, datasource, callback) {
  new TurboCarto(cartocss, datasource).getCartocss(callback);
}

module.exports = turbocarto;
module.exports.TurboCarto = TurboCarto;
module.exports.version = require('../package.json').version;
