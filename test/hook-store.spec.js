'use strict';

const assert = require('assert');
const { HookStore } = require('../index');

describe('HookStore', () => {

  const hook = it => {};

  it ('should add map type - hooks ok', () => {
    const hookStore = HookStore();

    hookStore.add({ 
      before : hook,
      after : [
        hook
      ]
    });

    assert.deepEqual(hookStore.get('before'), [hook]);
    assert.deepEqual(hookStore.get('after'), [hook]);
  });

  it ('should not add hook if it existed', () => {
    const hookStore = HookStore();

    hookStore.add('before', hook);
    hookStore.add('before', hook);
    hookStore.add('before', hook);

    assert.deepEqual(hookStore.get('before'), [hook]);
  });

  it ('should throw error when pass invalid input', () => {
    assert.throws(() => {
      HookStore().add({ before : 'INVALID_INPUT' })
    }, 'Hook of type [before] expected a function or array, but received [INVALID_INPUT]');
  })
})