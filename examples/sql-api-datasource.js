'use strict';

var qs = require('querystring');
var request = require('request');
if (global.document) {
  request = require('browser-request');
}

function SqlApiDatasource (query) {
  this.query = query;
}

module.exports = SqlApiDatasource;

SqlApiDatasource.prototype.getName = function () {
  return 'SqlApiDatasource';
};

SqlApiDatasource.prototype.getRamp = function (column, buckets, method, callback) {
  if (!callback) {
    callback = method;
    method = 'equal';
  }
  method = method || 'equal';
  querySummaryStats(this.query, column, method, buckets, function (err, ramp) {
    return callback(err, ramp);
  });
};

function querySummaryStats (query, column, method, buckets, callback) {
  var methods = {
    quantiles: 'CDB_QuantileBins(array_agg(distinct({{column}}::numeric)), {{buckets}}) as quantiles',
    equal: 'CDB_EqualIntervalBins(array_agg({{column}}::numeric), {{buckets}}) as equal',
    jenks: 'CDB_JenksBins(array_agg(distinct({{column}}::numeric)), {{buckets}}) as jenks',
    headtails: 'CDB_HeadsTailsBins(array_agg(distinct({{column}}::numeric)), {{buckets}}) as headtails'
  };

  var sql = [
    'select',
    methods[method] || methods.quantiles,
    'from ({{sql}}) _table_sql where {{column}} is not null'
  ].join('\n');
  var q = format(sql, {column: column, sql: query, buckets: buckets});

  request('http://development.localhost.lan:8080/api/v1/sql?' + qs.stringify({q: q}), function (err, response, body) {
    if (!err && response.statusCode === 200) {
      var result = JSON.parse(body).rows[0];
      return callback(null, result[method]);
    } else {
      return callback(err);
    }
  });
}

function format (str) {
  var replacements = Array.prototype.slice.call(arguments, 1);

  replacements.forEach(function (attrs) {
    Object.keys(attrs).forEach(function (attr) {
      str = str.replace(new RegExp('\\{\\{' + attr + '\\}\\}', 'g'), attrs[attr]);
    });
  });

  return str;
}
