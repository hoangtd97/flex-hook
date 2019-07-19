'use strict';

const Customers = {
  items : [{ id : 1000, name : 'Foo' }],
  async fetch (id) {
    return this.items.find(item => item.id === id);
  }
};

const Users = {
  items : [{ id : 2000, name : 'Bar' }],
  async fetch (id) {
    return this.items.find(item => item.id === id);
  }
};

const Items = {
  items : [
    { id : 1000, title : 'Nokia N7', price : 180 },
    { id : 2000, title : 'Iphone 5', price : 400 },
  ],
  async fetch (id) {
    return this.items.find(item => item.id === id);
  }
};

module.exports = { Customers, Users, Items };