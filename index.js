'use strict';

const HookableFactory = require('./src/hookable');
const HookStore = require('./src/hook-store');
const invokers = require('./src/invokers');
const extender = require('./src/extender');

const Hookable = HookableFactory({ invokers, HookStore, extender });

module.exports = Object.assign(Hookable, { HookableFactory, HookStore, invokers, extender });
