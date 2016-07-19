'use strict';

module.exports = function (min, max, numBuckets) {
  if (Array.isArray(min)) {
    numBuckets = max;
    max = min[1];
    min = min[0];
  }
  var buckets = [];
  var range = max - min;
  var width = range / (numBuckets - 1);
  if (width === Number.POSITIVE_INFINITY || width === Number.NEGATIVE_INFINITY) {
    width = 0;
  }
  for (var i = 0; i < numBuckets; i++) {
    buckets.push(min + i * width);
  }
  return buckets;
};
