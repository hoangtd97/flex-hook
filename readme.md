# Maximum Flexible Hook

[![npm](https://img.shields.io/badge/npm-1.0.4-green.svg)](https://www.npmjs.com/package/flex-hook)

Adding hook at everywhere, with every type, every interface, run on every mode to your function.

## Example

* Assume you have an order :

```js
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
```

* The following function generates excel rows for each order item, it does nothing except calling hooks : 

```js
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
```

* Then you can add some hooks :

```js
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
```

* Add it works :

```js
const summary = { total_price : 0, total_quantity : 0 };

const { rows } = await generateRows(order, summary);

const expectedRows = [
  { order_id : 10000, user : 'Bar', title : 'Nokia N7', price : 200, net : 180, quantity : 2, total_price : 400  },
  { order_id : 10000, user : 'Bar', title : 'Iphone 5', price : 500, net : 400, quantity : 2, total_price : 1000 },
];

const expectedSummary = { total_price : 1400, total_quantity : 4 };

assert.deepEqual(rows, expectedRows);

assert.deepEqual(summary, expectedSummary);
```

* Also, support cloning to reusing and extending :

```js
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
```

* And custom hookable interface with extender :

```js
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

// or
const extender = Hookable.extender.create({ pre : 'before', post : 'after', each : 'eachItem' });

const generateRowsWithCustomExtender = Hookable(generateRowsFactory, { extender });

generateRowsWithCustomExtender
.pre(async function fetchUser(it) {
  //...
})
.each(function addItemInfo(it) {
  //...
})
.post(function calSummary(it) {
  //...
});
```

# Hope you enjoy it!