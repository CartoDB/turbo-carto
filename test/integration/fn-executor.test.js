'use strict';

var assert = require('assert');
var FnExecutor = require('../../src/fn/fn-executor');
var DummyDatasource = require('../support/dummy-datasource');

describe('FnExecutor', function () {
  it('should exec a happy case', function () {
    var fn = new FnExecutor(new DummyDatasource(),
      'buckets', [
        'population',
        new FnExecutor(new DummyDatasource(),
          'ramp', [
            'population',
            new FnExecutor(new DummyDatasource(),
              'colorbrewer', [
                'GnBu'
              ]
            )
          ]
        )
      ]
    );
    return fn.exec()
      .then(function (result) {
        assert.deepEqual(result, {
          column: 'population',
          start: '#f0f9e8',
          ramp: [
            100000,
            '#f0f9e8',
            250000,
            '#bae4bc',
            500000,
            '#7bccc4',
            1000000,
            '#43a2ca',
            1500000,
            '#0868ac'
          ]
        });
      });
  });
});
