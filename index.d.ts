// ---------------------- Exported Values -------------------- //


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
 * f();
 * 
 * // Reuse & Extend by cloning 
 * const f2 = f.clone();
 * 
 * f2.hook('before', async it => it.store = await fetchStore(it.store_id));
 * 
 * f2();
 */
export default function Hookable (factory : Factory, options ?: HookableOptions<any>) : Hookable;

export function HookableFactory (dependencies : HookableFactoryDependencies<any>): Function;

export namespace HookStores {
  export const FunctionHookStore : createHookStore;
  export const ObjectHookStore : createHookStore;
};

export const extender : HookExtender<{ hook : Function }> & { create : CreateHookExtender<any> }

export namespace invokers {
  export const synchronous : Invoker<void>;
  export const parallel : Invoker<void>;
  export const sequence : Invoker<void>;
  export const middleware : Invoker<(err : any, result : any) => void>;
} 

// ---------------------- Exported Types -------------------- //

export interface KeyVal<T> {
  [key : string] : T
}

/**
 * Add one or more hook
 * @example
 * 
 * hook('before', it => {});
 * 
 * hook({
 *    before : [
 *      it => {},
 *      it => {},
 *    ],
 *    after : it => {}
 * });
 */
export type addHook<T> = (type : string | KeyVal<Function | Function[]>, hook ?: Function) => T;
export interface DefaultExtendedMethods { 
  hook : addHook<Hookable>; 
  clone : () => Hookable;
}

export interface HookableFactoryDependencies<T> {
  HookStore : createHookStore,
  invokers  : KeyVal<Invoker<any>>,
  extender  : HookExtender<T>
}

export type InvokerCode = 'synchronous' | 'parallel' | 'sequence' | 'middleware';

export type Factory = (hook : InvokeHook) => Function;

/**
 * @example
 * const it = {};
 * 
 * hook('before', it, 'synchronous');
 * hook('before', it, 'parallel', { limit : 5 });
 */
export type InvokeHook = (type: string | any, args: any[], invoker: InvokerCode | Invoker<any>, options ?: any) => any;

/**
 * @example
 * 
 * const parallelInvoker = async function (hooks, args, options) {
 *    return await Promise.all(hooks.map(async hook => hook(...args)));
 * }
 */
export type Invoker<T> = (hooks: Function[], args: any[], options ?: T) => void;

export interface HookableOptions<T> {
  hookStore ?: HookStore;
  extender  ?: HookExtender<T>;
  clone     ?: boolean;
}

export type HookExtender<T> = ({ func, hookStore } : {
  func      : Function, 
  hookStore : HookStore,
}) => Hookable<T>;

/**
 * @example 
 * 
 * const factory = hook => {
 *    const it = {};
 *    hook('before', [it], 'synchronous');
 *    //...
 *    hook('after', [it], 'synchronous');
 * }
 * 
 * const f1 = Hookable(factory, { extender : Hookable.extender.create(['before', 'after']) });
 * 
 * f1.before(it => {});
 * f1.after(it => {});
 * 
 * const f2 = Hookable(factory, { extender : Hookable.extender.create({ pre : 'before', post : 'after' }) });
 * 
 * f2.pre(it => {});
 * f2.post(it => {});
 */
export type CreateHookExtender<T> = (type : KeyVal<string> | string[]) => HookExtender<T>;

export interface HookStore {
  add : addHook<HookStore>,
  /**
   * Get hooks by type
   * @example
   * 
   * hookStore.get('before') => [it => {}, it => {}]
   */
  get(type: string | any): Function [];
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
 export type Hookable<T = DefaultExtendedMethods> = Function & T;