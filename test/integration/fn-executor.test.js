'use strict';

var assert = require('assert');
var FnExecutor = require('../../src/fn/fn-executor');
var DummyDatasource = require('../support/dummy-datasource');

describe('FnExecutor', function () {
  it('should exec a happy case', function () {
    var fn = new FnExecutor(
      new DummyDatasource(),
      'ramp',
      [
        'population',
        new FnExecutor(new DummyDatasource(),
          'colorbrewer', [
            'GnBu'
          ]
        )
      ],
      {
        parent: {
          append: function () {},
        },
        remove: function () {}
      }
    );
    return fn.exec()
      .then(function (result) {
        assert.deepEqual(result, [
          '#0868ac',
          1500000,
          '#43a2ca',
          1000000,
          '#7bccc4',
          500000,
          '#bae4bc',
          250000,
          '#f0f9e8',
          100000
        ]);
      });
  });
});
