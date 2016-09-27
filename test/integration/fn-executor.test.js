'use strict';

var assert = require('assert');
var FnExecutor = require('../../src/fn/executor');
var DummyDatasource = require('../support/dummy-datasource');
var postcss = require('postcss');

describe('FnExecutor', function () {
  function createDecl () {
    var root = postcss.rule({
      selector: '#root'
    });
    var decl = postcss.decl({ prop: 'color', value: 'red' });
    root.append(decl);

    return decl;
  }

  it('should exec a happy case', function () {
    var fn = new FnExecutor(new DummyDatasource(),
      'ramp',
      [
        'population',
        new FnExecutor(new DummyDatasource(),
          'colorbrewer', [
            'GnBu'
          ]
        )
      ],
      createDecl()
    );
    return fn.exec()
      .then(function (result) {
        assert.deepEqual(result.values, ['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac']);
        assert.deepEqual(result.filters, [0, 1, 2, 3, 4]);
      });
  });

  it('should use anonymous-tuple for empty function names', function () {
    var fn = new FnExecutor(new DummyDatasource(),
      'ramp',
      [
        'population',
        new FnExecutor(new DummyDatasource(),
          '', [
            'Red',
            'Green',
            'Blue'
          ]
        )
      ],
      createDecl()
    );
    return fn.exec()
      .then(function (result) {
        assert.deepEqual(result.values, ['Red', 'Green', 'Blue']);
        assert.deepEqual(result.filters, [0, 1, 2]);
      });
  });
});
