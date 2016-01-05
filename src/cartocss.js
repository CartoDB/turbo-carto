'use strict';

if (!process.argv[2]) {
  throw new Error('Must specify a css file');
}

var fs = require('fs');

var cartocss = fs.readFileSync(process.argv[2], {encoding: 'utf-8'});

module.exports = cartocss;
