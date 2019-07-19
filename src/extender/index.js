'use strict';

function DefaultHookExtender({ func, hookStore }) {
  
  func.hook = function addHook(...args) {
    hookStore.add(...args);
    return func;
  }

  return func;
}

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