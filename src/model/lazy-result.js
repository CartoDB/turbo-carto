function LazyResult(result, defaultKey, getter) {
  this.result = result;
  this.defaultKey = defaultKey;
  this.getter = getter;
}

module.exports = LazyResult;

LazyResult.prototype.get = function(key) {
  key = key || this.defaultKey;
  if (this.getter) {
    return this.getter(this.result, key);
  }
  return this.result.hasOwnProperty(key) ? this.result[key] : this.result[this.defaultKey];
};

LazyResult.prototype.getLenght = function(key) {
  return this.get(key).length;
};

LazyResult.prototype.getDefaultLenght = function() {
  return this.get().length;
};
