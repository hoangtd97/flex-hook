'use strict';

const HookableFactory = require('./src/hookable');
const HookStores = require('./src/hook-stores');
const invokers = require('./src/invokers');
const extender = require('./src/extender');

const Hookable = HookableFactory({ invokers, HookStore : HookStores.FunctionHookStore, extender });

module.exports = Object.assign(Hookable, { Hookable, HookableFactory, HookStores, invokers, extender });
