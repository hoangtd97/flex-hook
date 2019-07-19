'use strict';

const invokers = {
  synchronous (hooks, args, options) {
    for (let hook of hooks) {
      if (typeof hook === 'function') {
        try {
          hook(...args);
        }
        catch (err) {
          if (Array.isArray(err.reactions)) {
            if (err.reactions.includes('CONTINUE')) {
              continue;
            }
            if (err.reactions.includes('BREAK')) {
              break;
            }
          }
        }
      }
    }
  },
  async parallel (hooks, args, options) {
    const tasks = [];

    for (let hook of hooks) {
      if (typeof hook === 'function') {
        tasks.push(hook(...args));
      }
    }

    return Promise.all(tasks);
  },
  async sequence (hooks, args, options) {
    for (let hook of hooks) {
      if (typeof hook === 'function') {
        try {
          await hook(...args);
        }
        catch (err) {
          if (Array.isArray(err.reactions)) {
            if (err.reactions.includes('CONTINUE')) {
              continue;
            }
            if (err.reactions.includes('BREAK')) {
              break;
            }
          }
        }
      }
    }
  },
  middleware (hooks, args, callback) {

    function iterate(index) {

      if (index === hooks.length) {
        return callback && callback(null, ...args);
      }
      
      let hook = hooks[index];

      hook(...args, 
        function next(err) { 
          if (err) {
            return callback(err);
          }
          iterate(index + 1); 
        },
        function done(result) {
          return callback(null, result);
        }
      );
    };

    iterate(0);
  }
};

module.exports = invokers;