'use strict';

var assert = require('assert');
var turbocarto = require('../../src/index');
var DummyDatasource = require('../support/dummy-datasource');

describe('metadata', function () {
  it('should generate a valid metadata for jenks alike datasource', function (done) {
    var cartocss = [
      '#layer{',
      '  marker-width: ramp([pop_max], range(8, 32), jenks());',
      '}'
    ].join('\n');
    var jenksDatasource = new DummyDatasource(function () {
      return {
        ramp: [ 41316, 139843, 578470, 2769072, 35676000 ],
        stats: { min_val: -99, max_val: 35676000, avg_val: 322717 }
      };
    });
    turbocarto(cartocss, jenksDatasource, function (err, result, metadata) {
      assert.ifError(err);
      assert.strictEqual(metadata.rules.length, 1);

      var rule = metadata.rules[0];

      assert.strictEqual(rule.selector, '#layer');
      assert.strictEqual(rule.prop, 'marker-width');
      assert.strictEqual(rule.column, 'pop_max');
      assert.strictEqual(rule.buckets.length, 5);

      assert.strictEqual(rule.stats.filter_avg, 322717);

      var expectedBuckets = [
        { filter: { type: 'range', start: -99, end: 41316 }, value: 8 },
        { filter: { type: 'range', start: 41316, end: 139843 }, value: 14 },
        { filter: { type: 'range', start: 139843, end: 578470 }, value: 20 },
        { filter: { type: 'range', start: 578470, end: 2769072 }, value: 26 },
        { filter: { type: 'range', start: 2769072, end: 35676000 }, value: 32 }
      ];

      assert.deepStrictEqual(rule.buckets, expectedBuckets);

      done();
    });
  });

  it('should generate a valid metadata for jenks when datasource returns one value', function (done) {
    var cartocss = [
      '#layer{',
      '  marker-width: ramp([pop_max], (8), jenks());',
      '}'
    ].join('\n');
    var jenksDatasource = new DummyDatasource(function () {
      return {
        ramp: [ 8 ],
        stats: { min_val: 8, max_val: 8, avg_val: 8 }
      };
    });
    turbocarto(cartocss, jenksDatasource, function (err, result, metadata) {
      assert.ifError(err);
      assert.strictEqual(metadata.rules.length, 1);

      var rule = metadata.rules[0];

      assert.strictEqual(rule.selector, '#layer');
      assert.strictEqual(rule.prop, 'marker-width');
      assert.strictEqual(rule.column, 'pop_max');
      assert.strictEqual(rule.buckets.length, 1);

      assert.strictEqual(rule.stats.filter_avg, 8);

      var expectedBuckets = [
        { filter: { type: 'range', start: 8, end: 8 }, value: 8 }
      ];

      assert.deepStrictEqual(rule.buckets, expectedBuckets);

      done();
    });
  });

  it('should generate a valid metadata for headtails alike datasource', function (done) {
    var cartocss = [
      '#layerheads {',
      '  marker-width: ramp([pop_max], range(8, 32), headtails());',
      '}'
    ].join('\n');
    var headtailsDatasource = new DummyDatasource(function () {
      return {
        ramp: [ 325723, 1408234, 3680157, 7778065, 12880979 ],
        strategy: 'split',
        stats: { min_val: -99, max_val: 35676000, avg_val: 322717 }
      };
    });
    turbocarto(cartocss, headtailsDatasource, function (err, result, metadata) {
      assert.ifError(err);
      assert.strictEqual(metadata.rules.length, 1);

      var rule = metadata.rules[0];

      assert.strictEqual(rule.selector, '#layerheads');
      assert.strictEqual(rule.prop, 'marker-width');
      assert.strictEqual(rule.column, 'pop_max');
      assert.strictEqual(rule.buckets.length, 5);

      assert.strictEqual(rule.stats.filter_avg, 322717);

      var expectedBuckets = [
        { filter: { type: 'range', start: -99, end: 325723 }, value: 8 },
        { filter: { type: 'range', start: 325723, end: 1408234 }, value: 14 },
        { filter: { type: 'range', start: 1408234, end: 3680157 }, value: 20 },
        { filter: { type: 'range', start: 3680157, end: 7778065 }, value: 26 },
        { filter: { type: 'range', start: 7778065, end: 35676000 }, value: 32 }
      ];

      assert.deepStrictEqual(rule.buckets, expectedBuckets);

      done();
    });
  });

  it('should generate a valid metadata for headtails with datasource that returns one value', function (done) {
    var cartocss = [
      '#layerheads {',
      '  marker-width: ramp([pop_max], (8), headtails());',
      '}'
    ].join('\n');
    var headtailsDatasource = new DummyDatasource(function () {
      return {
        ramp: [ 325723 ],
        strategy: 'split',
        stats: { min_val: 100, max_val: 100, avg_val: 100 }
      };
    });
    turbocarto(cartocss, headtailsDatasource, function (err, result, metadata) {
      assert.ifError(err);
      assert.strictEqual(metadata.rules.length, 1);

      var rule = metadata.rules[0];

      assert.strictEqual(rule.selector, '#layerheads');
      assert.strictEqual(rule.prop, 'marker-width');
      assert.strictEqual(rule.column, 'pop_max');
      assert.strictEqual(rule.buckets.length, 1);

      assert.strictEqual(rule.stats.filter_avg, 100);

      var expectedBuckets = [
        { filter: { type: 'range', start: 100, end: 100 }, value: 8 }
      ];

      assert.deepStrictEqual(rule.buckets, expectedBuckets);

      done();
    });
  });

  it('should generate a valid metadata for category alike datasource', function (done) {
    var cartocss = [
      '#layercat{',
      '  marker-width: ramp([adm0name], cartocolor(Safe), category(8));',
      '}'
    ].join('\n');
    var headtailsDatasource = new DummyDatasource(function () {
      return {
        ramp: [
          'United States of America',
          'Russia',
          'China',
          'Brazil',
          'Canada',
          'Australia',
          'India',
          'Mexico'
        ],
        strategy: 'exact',
        stats: { min_val: undefined, max_val: undefined, avg_val: undefined } };
    });
    turbocarto(cartocss, headtailsDatasource, function (err, result, metadata) {
      assert.ifError(err);
      assert.strictEqual(metadata.rules.length, 1);

      var rule = metadata.rules[0];

      assert.strictEqual(rule.selector, '#layercat');
      assert.strictEqual(rule.prop, 'marker-width');
      assert.strictEqual(rule.column, 'adm0name');
      assert.strictEqual(rule.buckets.length, 9);

      assert.strictEqual(rule.stats.filter_avg, undefined);

      var expectedBuckets = [
        { filter: { type: 'category', name: 'United States of America' }, value: '#88CCEE' },
        { filter: { type: 'category', name: 'Russia' }, value: '#CC6677' },
        { filter: { type: 'category', name: 'China' }, value: '#DDCC77' },
        { filter: { type: 'category', name: 'Brazil' }, value: '#117733' },
        { filter: { type: 'category', name: 'Canada' }, value: '#332288' },
        { filter: { type: 'category', name: 'Australia' }, value: '#AA4499' },
        { filter: { type: 'category', name: 'India' }, value: '#44AA99' },
        { filter: { type: 'category', name: 'Mexico' }, value: '#999933' },
        { filter: { type: 'default' }, value: '#888888' }
      ];

      assert.deepStrictEqual(rule.buckets, expectedBuckets);

      done();
    });
  });
});
