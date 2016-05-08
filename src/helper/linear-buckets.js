'use strict';

module.exports = function (min, max, numBuckets) {
  var buckets = [];
  var range = max - min;
  var width = range / (numBuckets - 1);
  for (var i = 0; i < numBuckets; i++) {
    buckets.push(min + i * width);
  }
  return buckets;
};
