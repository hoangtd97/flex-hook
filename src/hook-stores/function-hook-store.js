'use strict';

/**
 * Store hook which just a function
 * @param {Object<string, function>} hooks 
 */
function FunctionHookStore(hooks) {

  const Private = {
    /** @type {Object<string, Function[]>} */
    hooks : hooks || {}
  };

  const Public = {
    add (type, hook) {
      if (type && typeof type === 'object') {
        return Public.addMap(type);
      }
      if (!Array.isArray(Private.hooks[type])) {
        Private.hooks[type] = [];
      }
      const foundHook = Private.hooks[type].find(h => h === hook);
      if (!foundHook) {
        Private.hooks[type].push(hook);
      }
      return Public;
    },
    addMap (hooksMap) {
      for (let type in hooksMap) {
        let hooks = hooksMap[type];

        if (typeof hooks === 'function') {
          hooks = [hooks];
        }
        if (!Array.isArray(hooks)) {
          throw new Error(`Hook of type [${type}] expected a function or array, but received [${hooks}]`);
        }
        for (let hook of hooks) {
          Public.add(type, hook);
        }
      }
      return Public;
    },
    get (type) {
      return Private.hooks[type];
    },
    clone () {
      const new_hooks = {};

      for (let type in Private.hooks) {
        new_hooks[type] = Array.from(Private.hooks[type]);
      }

      return FunctionHookStore(new_hooks);
    }
  };

  return Public;
}

module.exports = { FunctionHookStore };