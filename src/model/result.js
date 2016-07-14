function Result(result, getter) {
  this.result = result;
  this.getter = getter;
}

module.exports = Result;

Result.prototype.get = function(key) {
  if (this.getter) {
    return this.getter(this.result, key);
  }
  return this.result;
};

Result.prototype.getLenght = function(/*key*/) {
  return this.get().length;
};

Result.prototype.getDefaultLenght = function() {
  return this.get().length;
};
