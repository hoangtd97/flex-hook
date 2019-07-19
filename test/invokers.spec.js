'use strict';

const assert = require('assert');
const delay = require('delay');
const { invokers } = require('../index');

describe('invokers', () => {

  describe('synchronous', () => {
    it ('should break after invoke function 1st which throw signal BREAK', () => {
      const it = { synchronous : [] };
      const functions = [
        it => {
          it.synchronous.push('one');
          throw { reactions : ['BREAK'] };
        },
        it => {
          it.synchronous.push('two');
        }
      ];

      invokers.synchronous(functions, [it]);

      assert.deepEqual(it.synchronous, ['one']);
    })

    it ('should throw error after invoke function 1st which throw un-handle error', () => {
      try {
        const it = { synchronous : [] };
        const functions = [
          it => {
            it.synchronous.push('one');
            throw new Error('Something went wrong');
          },
          it => {
            it.synchronous.push('two');
          }
        ];
  
        invokers.synchronous(functions, [it]);
      }
      catch (err) {
        assert.ok(err.message === 'Something went wrong');
      }
    })
  })

  describe('sequence', () => {

    it ('should finish all functions in order', async () => {

      const it = { sequence : [] };
      const functions = [
        async it => {
          await delay(50);
          it.sequence.push('one');
        },
        async it => {
          await delay(20);
          it.sequence.push('two');
        }
      ];

      await invokers.sequence(functions, [it]);

      assert.deepEqual(it.sequence, ['one', 'two']);
    });

    it ('should break after invoke function 1st which throw signal BREAK', async () => {
      const it = { sequence : [] };
      const functions = [
        async it => {
          await delay(50);
          it.sequence.push('one');
          throw { reactions : ['BREAK'] };
        },
        async it => {
          await delay(20);
          it.sequence.push('two');
        }
      ];

      await invokers.sequence(functions, [it]);

      assert.deepEqual(it.sequence, ['one']);
    })

    it ('should throw error after invoke function 1st which throw un-handle error', async () => {
      try {
        const it = { sequence : [] };
        const functions = [
          async it => {
            await delay(50);
            it.sequence.push('one');
            throw new Error('Something went wrong');
          },
          async it => {
            await delay(20);
            it.sequence.push('two');
          }
        ];
  
        await invokers.sequence(functions, [it]);
      }
      catch (err) {
        assert.ok(err.message === 'Something went wrong');
      }
    })

  });

  describe('middleware', () => {

    it ('should finish all functions in order', () => {
      const it = { middleware : [], a : 1 };
      const functions = [
        (it, next, done) => {
          delay(50).then(() => { 
            it.middleware.push('one');
            next();
          });
        },
        (it, next, done) => {
          delay(20).then(() => { 
            it.middleware.push('two');
            next();
          });
        }
      ];

      invokers.middleware(functions, [it], (err, res) => {
        assert.ok(!err);
        assert.deepEqual(it.middleware, ['one', 'two']);
      });
    });

    it ('should finish after invoke function 1st which call done()', () => {
      const it = { middleware : [] };
      const functions = [
        (it, next, done) => {
          delay(50).then(() => { 
            it.middleware.push('one');
            done();
          })
        },
        (it, next, done) => {
          delay(20).then(() => { it.middleware.push('two') })
        }
      ];

      invokers.middleware(functions, [it], (err, res) => {
        assert.ok(!err);
        assert.deepEqual(it.middleware, ['one']);
      });
    })

    it ('should terminate after invoke function 1st which call next(err)', () => {
      const it = { middleware : [] };
      const functions = [
        (it, next, done) => {
          delay(50).then(() => { 
            it.middleware.push('one');
            next(new Error('Something went wrong!'))
          })
        },
        (it, next, done) => {
          delay(20).then(() => { it.middleware.push('two') })
        }
      ];

      invokers.middleware(functions, [it], (err, res) => {
        assert.ok(err.message === 'Something went wrong!');
      });
    })
  })
});