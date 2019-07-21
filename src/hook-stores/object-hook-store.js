'use strict';

/**
 * @typedef {Object<string, any>} ObjectHook
 * @property {string} code unique identifier
 * @property {function} do
 * 
 * @example 
 * {
 *    code : 'SYNC_ELASTICSEARCH',
 *    do   : async (item) => {...}
 * }
 */

/**
 * Store hook which is an object contain some management infos like : code, priority, do
 * @param {Object<string, ObjectHook>} hooks 
 */
function ObjectHookStore(hooks) {

  const Private = {
    /** @type {Object<string, ObjectHook[]>} */
    hooks : hooks || {},

  };

  const Public = {
    add (type, hook) {
      if (type && typeof type === 'object') {
        return Public.addMap(type);
      }
      if (Public.isValidHook(hook)) {
        if (!Array.isArray(Private.hooks[type])) {
          Private.hooks[type] = [];
        }
        const foundHook = Private.hooks[type].find(h => h.code === hook.code);
        if (!foundHook) {
          Private.hooks[type].push(hook);
        }
        return Public;
      }
    },
    addMap (hooksMap) {
      for (let type in hooksMap) {
        let hooks = hooksMap[type];
        if (hooks && typeof hooks === 'object' && !Array.isArray(hooks)) {
          hooks = [hooks];
        }
        if (!Array.isArray(hooks)) {
          throw new Error(`Hooks of type [${type}] expected an object or array, but received [${hooks}]`);
        }
        for (let hook of hooks) {
          Public.add(type, hook);
        }
      }
      return Public;
    },
    /**
     * Get hooks do
     * @param {string | Object<string, string[]>} options hook type or Map<hook type, hook codes>
     * 
     * @example 
     * 
     * const hookStore = ObjectHookStore();
     * 
     * const hookA = { code : 'A', do : it => {} };
     * const hookB = { code : 'B', do : it => {} };
     * const hookC = { code : 'C', do : it => {} };
     * 
     * hookStore.add({ before : [hookA, hookB, hookC] });
     * 
     * assert.deepEqual(hookStore.get('before'), [hookA.do, hookB.do, hookC.do]);
     * assert.deepEqual(hookStore.get({ before : ['A', 'C'] }), [hookA.do, hookC.do]);
     */
    get (options) {
      if (typeof options === 'string') {
        if (Private.hooks[options]) {
          return Private.hooks[options].map(hook => hook.do);
        }
      }
      if (options && typeof options === 'object') {
        const hooks = [];

        for (let type in options) {
          if (Private.hooks[type]) {
            let codes = options[type];
            if (codes === '*') {
              Private.hooks[type].forEach(hook => {
                hooks.push(hook.do);
              });
            }
            else if (Array.isArray(codes) && codes.length > 0) {
              Private.hooks[type].forEach(hook => {
                if (codes.includes(hook.code)) {
                  hooks.push(hook.do);
                }
              });
            }
          }
        }

        return hooks.length > 0 ? hooks : null;
      }
    },
    clone () {
      const new_hooks = {};

      for (let type in Private.hooks) {
        new_hooks[type] = Array.from(Private.hooks[type]);
      }

      return ObjectHookStore(new_hooks);
    },
    isValidHook(hook) {
      if (!(hook && typeof hook === 'object' && typeof hook.code === 'string' && typeof hook.do === 'function')) {
        throw new Error(`Hook expected an object with properties code, do. But received ${hook}`);
      }
      return true;
    }
  };

  return Public;
}

module.exports = { ObjectHookStore };