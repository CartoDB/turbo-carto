'use strict';

function minMaxNumericKey (obj) {
  return Object.keys(obj).reduce(function (minMax, k) {
    if (Number.isFinite(+k)) {
      if (minMax.min === null) {
        minMax.min = +k;
      }
      if (minMax.max === null) {
        minMax.max = +k;
      }
      minMax.max = Math.max(minMax.max, +k);
      minMax.min = Math.min(minMax.min, +k);
    }
    return minMax;
  }, { min: null, max: null });
}

module.exports = minMaxNumericKey;
