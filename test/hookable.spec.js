'use strict';

const Hookable = require('..');
const assert = require('assert');

const { Users, Customers, Items } = require('./mock');

describe('Hookable', () => {
  describe('generateRows', () => {

    function generateRowsFactory(hook) {
      return async function generateRows(order, summary) {
  
        const it = { order, summary, result : { rows : [] } };
  
        await hook('before', [it], 'parallel');
  
        for (let item of order.items) {
  
          it.session = { item, row : {} };
  
          hook('eachItem', [it], 'synchronous');
  
          it.result.rows.push(it.session.row);
        }
  
        hook('after', [it], 'synchronous');
  
        return it.result;
      }
    }

    const generateRows = Hookable(generateRowsFactory);

    generateRows
      .hook('before', async function fetchUser(it) {
        it.user = await Users.fetch(it.order.user_id);
      })
      .hook('before', async function fetchItems(it) {
        await Promise.all(it.order.items.map(async item => item.detail = await Items.fetch(item.id)));
      })
      .hook('eachItem', function addOrderInfo(it)  {
        const { row } = it.session;
        row.order_id = it.order.id;
        row.user     = it.user.name;
      })
      .hook('eachItem', function addItemInfo(it) {
        const { row, item } = it.session;
        row.title           = item.detail.title;
        row.price           = item.price;
        row.net             = item.detail.price;
        row.quantity        = item.quantity;
        row.total_price     = row.price * row.quantity;
      })
      .hook('after', function calSummary(it) {
        it.summary.total_price = it.result.rows.reduce((sum, row) => sum + row.total_price, 0); 
        it.summary.total_quantity = it.result.rows.reduce((sum, row) => sum + row.quantity, 0); 
      });
  
    const order = {
      id          : 10000,
      customer_id : 1000,
      user_id     : 2000,
      items : [
        {
          id       : 1000,
          price    : 200,
          quantity : 2
        },
        {
          id       : 2000,
          price    : 500,
          quantity : 2
        }
      ]
    };
  
    it ('should allow hook', async () => {
      const summary = { total_price : 0, total_quantity : 0 };
  
      const { rows } = await generateRows(order, summary);
  
      const expectedRows = [
        { order_id : 10000, user : 'Bar', title : 'Nokia N7', price : 200, net : 180, quantity : 2, total_price : 400  },
        { order_id : 10000, user : 'Bar', title : 'Iphone 5', price : 500, net : 400, quantity : 2, total_price : 1000 },
      ];
  
      const expectedSummary = { total_price : 1400, total_quantity : 4 };
  
      assert.deepEqual(rows, expectedRows);
  
      assert.deepEqual(summary, expectedSummary);
    });
  
    it ('should clone to reuse and extend', async () => {
      
      const generateRowsWithCustomer = generateRows.clone();
  
      generateRowsWithCustomer
      .hook('before', async function fetchCustomer(it) {
        it.customer = await Customers.fetch(it.order.customer_id);
      })
      .hook('eachItem', function addCustomerInfo(it) {
        const { row } = it.session;
        row.customer  = it.customer.name;
      });
  
      const summary = { total_price : 0, total_quantity : 0 };
  
      const { rows : rowWithCustomer } = await generateRowsWithCustomer(order, summary);
  
      const expectedRowsWithCustomer = [
        { order_id : 10000, customer : 'Foo', user : 'Bar', title : 'Nokia N7', price : 200, net : 180, quantity : 2, total_price : 400  },
        { order_id : 10000, customer : 'Foo', user : 'Bar', title : 'Iphone 5', price : 500, net : 400, quantity : 2, total_price : 1000 },
      ];
  
      assert.deepEqual(rowWithCustomer, expectedRowsWithCustomer);
  
      const { rows } = await generateRows(order, summary);
  
      const expectedRows = [
        { order_id : 10000, user : 'Bar', title : 'Nokia N7', price : 200, net : 180, quantity : 2, total_price : 400  },
        { order_id : 10000, user : 'Bar', title : 'Iphone 5', price : 500, net : 400, quantity : 2, total_price : 1000 },
      ];
  
      assert.deepEqual(rows, expectedRows);
    });
  
    it ('should allow custom extender', async () => {
  
      const extender = ({ func, hookStore }) => {
        func.pre = (hook) => {
          hookStore.add('before', hook);
          return func;
        }
        func.post = (hook) => {
          hookStore.add('after', hook);
          return func;
        }
        func.each = (hook) => {
          hookStore.add('eachItem', hook);
          return func;
        }
        return func;
      }
  
      const generateRowsWithCustomExtender = Hookable(generateRowsFactory, { extender });
  
      generateRowsWithCustomExtender
      .pre(async function fetchUser(it) {
        it.user = await Users.fetch(it.order.user_id);
      })
      .pre(async function fetchItems(it) {
        await Promise.all(it.order.items.map(async item => item.detail = await Items.fetch(item.id)));
      })
      .each(function addOrderInfo(it)  {
        const { row } = it.session;
        row.order_id = it.order.id;
        row.user     = it.user.name;
      })
      .each(function addItemInfo(it) {
        const { row, item } = it.session;
        row.title           = item.detail.title;
        row.price           = item.price;
        row.net             = item.detail.price;
        row.quantity        = item.quantity;
        row.total_price     = row.price * row.quantity;
      })
      .post(function calSummary(it) {
        it.summary.total_price = it.result.rows.reduce((sum, row) => sum + row.total_price, 0); 
        it.summary.total_quantity = it.result.rows.reduce((sum, row) => sum + row.quantity, 0); 
      });
  
      const summary = { total_price : 0, total_quantity : 0 };
  
      const { rows } = await generateRowsWithCustomExtender(order, summary);
  
      const expectedRows = [
        { order_id : 10000, user : 'Bar', title : 'Nokia N7', price : 200, net : 180, quantity : 2, total_price : 400  },
        { order_id : 10000, user : 'Bar', title : 'Iphone 5', price : 500, net : 400, quantity : 2, total_price : 1000 },
      ];
  
      const expectedSummary = { total_price : 1400, total_quantity : 4 };
  
      assert.deepEqual(rows, expectedRows);
  
      assert.deepEqual(summary, expectedSummary);
    })
  });

  it ('should mock express app ok', async () => {
  
    const extender = ({ func, hookStore }) => {
      func.use = middleware => { 
        hookStore.add('use', middleware);
        return func;
      }
      func.handle = handler => {
        hookStore.add('handle', handler);
        return func;
      }
      return func;
    }

    const app = Hookable(hook => function App() {
      const req = {};
      const res = {
        _status : 200,
        status (status) { this._status = status; return this },
        end (message) { console.log(`[RESPONSE] ${message} ${this._status}`); }
      };

      hook('use', [req, res], 'middleware', (err, result) => {
        if (err) {
          return hook('handle', [err, req, res], 'middleware', (err) => {
            if (err) { throw err }
          });
        }
      });
    }, { extender });

    app
    .use((req, res, next) => {
      req.started_at = Date.now();
      next();
    })
    .use((req, res, next) => {
      next(assert.ok(req.started_at));
    })
    .use((req, res, next) => {
      next({ code : 'ERR_NOT_PERMISSION' })
    })
    .handle((err, req, res, next) => {
      assert.ok(err.code === 'ERR_NOT_PERMISSION');
      return res.status(403).end('Not permission');
    })
    .handle((err, req, res, next) => {
      assert.fail('should not be called');
    })

    app();
  })

  it ('should allow custom invoker', async () => {

    function reverseInvoker(hooks, args) {
      const reversedHooks = hooks.reverse();
      for (let hook of reversedHooks) {
        hook(...args);
      }
    }

    const it = { sequence : [] };

    const f = Hookable(hook => async (it) => {
      hook('pre', [it], reverseInvoker);
    })

    f.hook('pre', it => it.sequence.push('one'));
    f.hook('pre', it => it.sequence.push('two'));
    f.hook('pre', it => it.sequence.push('three'));

    f(it);

    assert.deepEqual(it.sequence, ['three', 'two', 'one']);
  })

  it ('should throw error when pass invalid invoker', () => {

    const f = Hookable(hook => (it) => {
      hook('pre', [it], '?');
    });

    assert.throws(f, { message : 'Invalid invoker [?]' });
  })

  it ('should allow use ObjectHookStore to invoke hooks via codes', () => {
    const { HookableFactory, HookStores } = Hookable;

    const ObjectHookable = HookableFactory({ HookStore : HookStores.ObjectHookStore });
    
    const hookA = { code : 'A', do : it => it.result.push('A') };
    const hookB = { code : 'B', do : it => it.result.push('B') };
    const hookC = { code : 'C', do : it => it.result.push('C') };

    const f = ObjectHookable(hook => (it, { before = '*' }={}) => {
      hook({ before }, [it], 'synchronous');

      return it;
    });

    f.hook({ before : [hookA, hookB, hookC] });

    assert.deepEqual( 
      f({ result : [] }).result, 
      ['A', 'B', 'C']
    );

    assert.deepEqual( 
      f({ result : [] }, { before : ['A', 'C'] }).result, 
      ['A', 'C']
    );
  })
});

