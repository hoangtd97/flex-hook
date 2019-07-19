'use strict';

export interface HookableOptions {
  hookStore: HookStore;
  extender : HookExtender;
}

/**
 * Create new hookable function
 * 
 * @example 
 * 
 * const f = Hookable(hook => async function f() {
 *    const it = { user_id : 1000, store_id : 2000 };
 *    await hook('before', [it], 'parallel');
 *    //...
 *    hook('after', [it], 'synchronous');
 * });
 * 
 * // add hook by chaining
 * f
 * .hook('before', async it => it.started_at = Date.now());
 * .hook('before', async it => it.user = await fetchUser(it.user_id));
 * .hook('after', it => it.time = Date.now() - it.started_at);
 * 
 * // or use map, usually via config
 * f.hook({
 *  before : [
 *    async it => it.started_at = Date.now(),
 *    async it => it.user = await fetchUser(it.user_id)
 *  ],
 *  after : it => it.time = Date.now() - it.started_at
 * });
 * 
 * f();
 * 
 * // Reuse & Extend by cloning 
 * const f2 = f.clone();
 * 
 * f2.hook('before', async it => it.store = await fetchStore(it.store_id));
 * 
 * f2();
 */
export default function Hookable(factory: (hook: InvokeHook) => Function, options : HookableOptions): Hookable;

/**
 * @example
 * const it = {};
 * 
 * hook('before', it, 'synchronous');
 * hook('before', it, 'parallel', { limit : 5 });
 */
export type InvokeHook = (type: string, args: any[], invoker: string | Function, options: any) => any;


export interface HookStore {
  /**
   * Add one hook
   * @example
   * 
   * hookStore.add('before', it => {});
   */
  add(type: string, hook: Function): HookStore;
  /**
   * Add some hooks map by type
   * @example
   * 
   * hookStore.add({
   *    before : [
   *      it => {},
   *      it => {},
   *    ],
   *    after : it => {}
   * });
   */
  add(hooks : Object<string, Function | Function []>): HookStore;
  /**
   * Get hooks by type
   * @example
   * 
   * hookStore.get('before') => [it => {}, it => {}]
   */
  get(type: string): Function [];
  /**
   * clone store
   * @example
   * 
   * const hookStore = HookStore({
   *    before : [it => {}]
   * });
   * 
   * const hookStoreCopy = hookStore.clone();
   * 
   * hookStoreCopy.add('before', it => {});
   * 
   * hookStore.get('before').length => 1
   * hookStoreCopy.get('before').length => 2
   * 
   */
  clone(): HookStore;
}

export type createHookStore = (hookStore : HookStore) => HookStore;

/**
 * @example
 * 
 * const parallelInvoker = async function (hooks, args, options) {
 *    return await Promise.all(hooks.map(async hook => hook(...args)));
 * }
 */
export type Invoker = (hooks: Function[], args: any[], options: any) => void;

/**
 * Your hookable interface depend on which extender was used.
 * @example
 * const extender = (f, store) => {
 *    f.use = (hook) => store.add('after', hook);
 * }
 * 
 * const f = Hookable(hook => () => {
 *    const it = {};
 *    //...
 *    hook('after', [it], 'synchronous');
 * }, { extender });
 * 
 * f.use(it => {});
 */
export type Hookable<T> = Function & T;

export type HookExtender<T> = (
  func      : Function, 
  factory   : Function,
  hookStore : HookStore,
  HookStore : createHookStore,
  Hookable  : Hookable
) => Hookable<T>;

export const extender : HookExtender<{ hook : Function }> & { create : (types : Object<string, string> | string[]) => HookExtender };

export interface HookableFactoryDependencies {
  HookStore : createHookStore,
  invokers  : Object<string, Invoker>,
  extender  : HookExtender
}

export function HookableFactory(dependencies : HookableFactoryDependencies): Hookable;
