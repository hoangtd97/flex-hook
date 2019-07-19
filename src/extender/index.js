'use strict';

/**
 * Add hook() to func
 */
function DefaultHookExtender({ func, hookStore }) {
  
  func.hook = function addHook(...args) {
    hookStore.add(...args);
    return func;
  }

  return func;
}

/**
 *  
 * @param {Object<string, string> | string[]} types
 * 
 * @example 
 * 
 * const factory = hook => {
 *    const it = {};
 *    hook('before', [it], 'synchronous');
 *    //...
 *    hook('after', [it], 'synchronous');
 * }
 * 
 * const f1 = Hookable(factory, { extender : Hookable.extender.create(['before', 'after']) });
 * 
 * f1.before(it => {});
 * f1.after(it => {});
 * 
 * const f2 = Hookable(factory, { extender : Hookable.extender.create({ pre : 'before', post : 'after' }) });
 * 
 * f2.pre(it => {});
 * f2.post(it => {});
 */
function createHookExtender(types) {
  let alias_types = types;

  if (Array.isArray(types)) {
    alias_types = types.map(type => Object({ [type] : type }));
  }
  if (!(alias_types && typeof alias_types === 'object')) {
    throw new Error(`Types expected an array or map, but received ${alias_types}`);
  }

  return function CustomHookExtender({ func, hookStore }) {
    for (let alias in alias_types) {
      let type = alias_types[alias];
      func[alias] = function addHook(...args) {
        hookStore.add(type, ...args);
        return func;
      }
    }
  }
}

module.exports = Object.assign(DefaultHookExtender, { create : createHookExtender });