'use strict';

function ValuesResult (result, defaultSize, getter) {
  this.result = result;
  this.defaultSize = defaultSize || result.length;
  this.getter = getter;
}

module.exports = ValuesResult;

ValuesResult.prototype.get = function (size) {
  size = size || this.defaultSize;
  if (this.getter) {
    return this.getter(this.result, size);
  }

  if (Array.isArray(this.result)) {
    return this.result;
  }

  return this.result.hasOwnProperty(size) ? this.result[size] : this.result[this.defaultSize];
};

ValuesResult.prototype.getLength = function (size) {
  return this.get(size).length;
};

ValuesResult.prototype.toString = function () {
  return JSON.stringify({
    result: this.result,
    defaultSize: this.defaultSize,
    getter: this.getter && this.getter.toString()
  });
};

ValuesResult.prototype.is = function (constructor) {
  return this.constructor === constructor;
};