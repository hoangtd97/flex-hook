'use strict';

const assert = require('assert');
const Hookable = require('../index');

describe ('extender.create() : ', () => {

  const F = hook => (it) => {
    hook('pre', [it], 'synchronous');
    hook('post', [it], 'synchronous');
    return it;
  }

  it ('should work with list hook types', () => {
    const extender = Hookable.extender.create(['pre', 'post']);
    const f = Hookable(F, { extender });

    f.pre(it => it.pre = true);
    f.post(it => it.post = true);

    const it = {};

    f(it);

    assert.ok(it.pre && it.post);
  });

  it ('should work with map hooks alias - type', () => {
    const extender = Hookable.extender.create({ before : 'pre', after : 'post' });
    const f = Hookable(F, { extender });

    f.before(it => it.pre = true);
    f.after(it => it.post = true);

    const it = {};

    f(it);

    assert.ok(it.pre && it.post);
  });

  it ('should throw error when pass wrong options', () => {
    assert.throws(() => {
      Hookable.extender.create('WRONG_OPTIONS');
    });
  })
});