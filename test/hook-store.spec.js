'use strict';

const assert = require('assert');
const { HookStores } = require('../index');

describe('HookStores', () => {
  describe('FunctionHookStore', () => {
    const { FunctionHookStore } = HookStores;
    const hook = it => {};

    it ('should add map type - hooks ok', () => {
      const hookStore = FunctionHookStore();
  
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
      const hookStore = FunctionHookStore();
  
      hookStore.add('before', hook);
      hookStore.add('before', hook);
      hookStore.add('before', hook);
  
      assert.deepEqual(hookStore.get('before'), [hook]);
    });
  
    it ('should throw error when pass invalid input', () => {
      assert.throws(() => {
        FunctionHookStore().add({ before : 'INVALID_INPUT' })
      }, { message : 'Hook of type [before] expected a function or array, but received [INVALID_INPUT]' });
    })
  })

  describe('ObjectHookStore', () => {
    const { ObjectHookStore } = HookStores;

    const hook = {
      code : 'HOOK',
      do   : it => {}
    };

    it ('should add map type - hooks ok', () => {
      const hookStore = ObjectHookStore();
  
      hookStore.add({ 
        before : hook,
        after : [
          hook
        ]
      });
  
      assert.deepEqual(hookStore.get('before'), [hook.do]);
      assert.deepEqual(hookStore.get('after'), [hook.do]);
    });
  
    it ('should not add hook if it existed', () => {
      const hookStore = ObjectHookStore();
  
      hookStore.add('before', hook);
      hookStore.add('before', hook);
      hookStore.add('before', hook);
  
      assert.deepEqual(hookStore.get('before'), [hook.do]);
    });
  
    it ('should throw error when pass invalid input', () => {
      assert.throws(() => {
       ObjectHookStore().add({ before : 'INVALID_INPUT' })
      }, { message : 'Hooks of type [before] expected an object or array, but received [INVALID_INPUT]' });
    })

    it ('should get hooks by codes ok', () => {
      const hookStore = ObjectHookStore();

      const hookA = { code : 'A', do : it => {} };
      const hookB = { code : 'B', do : it => {} };
      const hookC = { code : 'C', do : it => {} };

      hookStore.add({ before : [hookA, hookB, hookC] });

      assert.deepEqual(hookStore.get('before'), [hookA.do, hookB.do, hookC.do]);
      assert.deepEqual(hookStore.get({ before : ['A', 'C'] }), [hookA.do, hookC.do]);
    })

    it ('should clone ok', () => {
      const hookStore = ObjectHookStore();

      const hookA = { code : 'A', do : it => {} };
      const hookB = { code : 'B', do : it => {} };
      const hookC = { code : 'C', do : it => {} };

      hookStore.add({ before : [hookA, hookB] });

      const hookStoreCopy = hookStore.clone();

      assert.deepEqual(hookStoreCopy.get('before'), [hookA.do, hookB.do]);

      hookStoreCopy.add('before', hookC);

      assert.deepEqual(hookStoreCopy.get('before'), [hookA.do, hookB.do, hookC.do]);
      assert.deepEqual(hookStore.get('before'), [hookA.do, hookB.do]);
    })
  })

})