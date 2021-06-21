import { Barrier, once, pmap } from '../mutexHelper.js';
import { passThroughProvider, Provider } from '../provider.js';

export interface Dictionary<T> {
  [key: string]: T;
}

/**
 * Extract a subset from a larger dictionary
 *
 * @param all
 * @param keyList
 * @return subset
 */
export function lookup<T>(all: Dictionary<T>, keyList: string[]): Dictionary<T> {
  return keyList.map((k) => ({ k, v: all[k] })).filter((kv) => !!kv.v).reduce(
    (acc, { k, v }) => {
      acc[k] = v;
      return acc;
    }, {},
  );
}

export function join<T>(kvList: { k: string, v: T }[]): Dictionary<T> {
  return kvList.reduce(
    (acc, { k, v }) => {
      acc[k] = v;
      return acc;
    }, {},
  );
}

export function split<T>(dict: Dictionary<T>): { k: string, v: T }[] {
  return Object.entries(dict).map(
    ([k, v]) => ({ k, v }),
  );
}

/**
 * Convert a dictionary of promises to a promise
 * for a dictionary
 */
export function toPromise<T>(dict: Dictionary<Promise<T>>): Promise<Dictionary<T>> {
  return Promise.all(
    split(dict).map(
      (kv) => kv.v.then((v) => ({ k: kv.k, v })),
    ),
  ).then(
    (kvList) => join(kvList),
  );
}

export type ConfigDb = Dictionary<Dictionary<any>>;

/**
 * An entry in the AppContext configuration db - has
 * default dictionary and loaded overrides,
 * can do simple shallow merge with { ...defaults, ...overrides }
 */
export interface ConfigEntry {
  defaults: Dictionary<any>;
  overrides: Dictionary<any>;
}

export interface AppContextConfig {
  configHref: string[];
  loadConfig: (href: string) => Promise<Dictionary<Dictionary<any>>>;
}

export type ToolBox = Dictionary<Provider<any>>;

export function getTools(tb: ToolBox): Promise<Dictionary<any>> {
  return toPromise(
    join(
      split(tb).map(({ k, v }) => ({ k, v: v.get() })),
    ),
  );
}

export type ToolFactory<T> = (toolbox: ToolBox) => Provider<T> | Promise<Provider<T>>;

export interface ProviderInfo {
  key: string;
  toolKeys: Dictionary<string>;
  lambda: ToolFactory<any>;
}

/**
 * Core application context database decoupled
 * from custom element configuration mechanism
 *
 * LifeCycle:
 *    singleton - put config accepted
 *    started   - lookup config accepted, no new puts
 */
export class AppContext {
  public static build(config: AppContextConfig): Promise<AppContext> {
    if (AppContext.singletonBarrier.state !== 'unresolved') {
      throw new Error('Singleton AppContext already initialized');
    }
    const singleton = new AppContext(config);
    AppContext.singletonBarrier.signal(
      singleton.init().then(() => singleton),
    );
    return AppContext.singletonBarrier.wait();
  }

  public static get(): Promise<AppContext> { return AppContext.singletonBarrier.wait(); }

  private static singletonBarrier: Barrier<AppContext> = new Barrier<AppContext>();

  public config: AppContextConfig;

  /**
     * Trigger context launch - invoke once
     * from main().
     *
     * @returns a list of tools that
     * are required by registered providers, but
     * unbound.
     */
  public start: () => Promise<string[]> = once(
    async () => {
      const configList: Dictionary<Dictionary<any>>[] = await pmap(
        this.config.configHref,
        (url) => this.config.loadConfig(url),
      );
      this.overrideConfigs = configList.reduce(
        (acc, db) => Object.assign(acc, db),
        {},
      );
      // register a provider for any keys not already
      Object.keys(this.overrideConfigs).forEach(
        (configKey) => {
          const providerKey = `config/${configKey}`;
          if (!this.providerDb.hasOwnProperty(providerKey)) {
            // go ahead and register a provider that retrieves the configuration
            const configProvider = passThroughProvider(() => this.getConfig(configKey));
            this.providerDb[providerKey] = () => Promise.resolve(configProvider);
          }
        },
      );
      const unboundTools = [...this.allToolKeys].filter((k) => !this.providerDb.hasOwnProperty(k));
      if (!this.startBarrier.signal(unboundTools)) {
        throw new Error('Context perviously started');
      }
      return this.startBarrier.wait();
    },
    () => { throw new Error('Context perviously started'); },
  );

  private defaultConfigs: ConfigDb = {};

  private overrideConfigs: ConfigDb = {};

  // Dictionary of lazy-initialized providers.
  // The Provider factory is not invoked until
  // the first request for the provider.
  private providerDb: Dictionary<() => Promise<Provider<any>>> = {};

  private allToolKeys: Set<string> = new Set();

  private state: Dictionary<any> = {};

  private subscriptions: Dictionary<any> = {};

  private startBarrier = new Barrier<string[]>();

  /**
     * Constructor takes an immutable configuration
     */
  constructor(config: AppContextConfig) {
    this.config = { ...config };
  }

  /**
     * Register a new provider.
     * A provider's factory specifies the dependencies (toolbox)
     * it wants injected.  A tool dependency must start with
     * driver/, alias/, or config/ - where config/ translates
     * into a call to context.getConfig
     *
     * @param keyIn automatically prepended with "driver/" if not already
     * @param toolKeys map from global key (driver/, alias/, or config/)
     *           to the internal key passed to the tool factory
     * @param lambda
     */
  public putProvider(keyIn: string, toolKeys: Dictionary<string>, lambda: ToolFactory<any>) {
    const key = keyIn.replace(/^\/*(driver\/+)*/, 'driver/');
    this.putProviderOrAlias(key, toolKeys, lambda);
  }

  /**
     * Register a lambda to run at startup
     *
     * @param toolKeys to inject into lambda - alias to rawKey
     * @param lambda
     */
  public onStart<T>(toolKeys: Dictionary<string>, lambda: (ToolBox) => T | Promise<T>): Promise<T> {
    return this.startBarrier.wait().then(
      () => this.fillToolBox(toolKeys).then((toolBox) => lambda(toolBox)),
    );
  }

  /**
     * Register a new provider.
     *
     * @param alias automatically prepended with "alias/" if not already
     * @param driverName automatically prepended with "driver/" if not already
     */
  public putAlias(alias: string, driverName: string) {
    const key = alias.replace(/^\/*(alias\/+)*/, 'alias/');
    const tools = { driver: driverName };

    this.putProviderOrAlias(key, tools,
      (toolBox) => toolBox.driver);
  }

  /**
     *
     * @param key must start with driver/, alias/, or config/
     */
  public getProvider<T>(key: string): Promise<Provider<T>> {
    return this.startBarrier.wait().then(
      () => {
        let factory = this.providerDb[key];
        if (!factory && key.startsWith('config/')) {
          // go ahead and register a provider that retrieves the configuration
          const configKey = key.replace(/^config\//, '');
          const configProvider = passThroughProvider(() => this.getConfig(configKey));
          factory = () => Promise.resolve(configProvider);
          this.providerDb[key] = factory;
        }

        if (!factory) {
          throw new Error(`no provider registered for key ${key}`);
        }
        return factory();
      },
    );
  }

  /**
     * Put a default configuration into the context.
     * Note that config overrides loaded at runtime
     * overwrite a default put into the context.
     * This method is intended for use by modules that
     * want to register default configuration at
     * startup time.  Multiple calls to putDeafultConfig
     * with the same key call Object.assign() to augment
     * the previous value.
     *
     * @param contextIn
     * @param key
     */
  public putDefaultConfig(key: string, value: Dictionary<any>): void {
    const configKey = key.replace(/^config\//, '');
    const providerKey = `config/${configKey}`;
    const currentConfig = this.defaultConfigs[configKey] || {};
    this.defaultConfigs[configKey] = { ...currentConfig, ...value };
    if (!this.providerDb.hasOwnProperty(providerKey)) {
      // go ahead and register a provider that retrieves the configuration
      const configProvider = passThroughProvider(() => this.getConfig(configKey));
      this.providerDb[providerKey] = () => Promise.resolve(configProvider);
    }
  }

  public async getConfig(key: string): Promise<ConfigEntry> {
    return this.startBarrier.wait().then(
      () => (
        {
          defaults: this.defaultConfigs[key] || {},
          overrides: this.overrideConfigs[key] || {},
        }
      ),
    );
  }

  // eslint-disable-next-line
  public async getState(key: string, part: string): Promise<any> {
    return null;
  }

  // eslint-disable-next-line
  public async changeState(key: string, handler: (state: any) => Promise<any>): Promise<any> {
    return null;
  }

  /**
     * Load the remote configuration specified
     * by the constructor injected properties
     */
  private init(): Promise<void> {
    return Promise.resolve();
  }

  private fillToolBox(toolKeys: Dictionary<string>): Promise<ToolBox> {
    return Promise.all(
      split(toolKeys).map(
        (kv) => {
          const rawKey = kv.v;
          const alias = kv.k;
          const providerFactory = this.providerDb[rawKey];
          if (!providerFactory) {
            throw new Error(`failed to fill toolbox - missing dependency ${rawKey}`);
          }
          return providerFactory().then((v) => ({ k: alias, v }));
        },
      ),
    ).then((kvList) => join(kvList));
  }

  private putProviderOrAlias(key: string, toolKeys: Dictionary<string>, lambda: ToolFactory<any>) {
    if (this.providerDb.hasOwnProperty(key)) {
      throw new Error(`provider already registered for ${key}`);
    }
    Object.values(toolKeys).forEach(
      (k) => {
        if (k.startsWith('driver/') || k.startsWith('alias/') || k.startsWith('config/')) {
          if (k.startsWith('config/') && !this.providerDb.hasOwnProperty(k)) {
            // go ahead and register a provider that retrieves the configuration
            const configProvider = passThroughProvider(() => this.getConfig(k.replace(/^config\//, '')));
            this.providerDb[k] = () => Promise.resolve(configProvider);
          }
          this.allToolKeys.add(k);
        } else {
          throw new Error(`Provider ${key} requested invalid tool key ${k} - must start with "driver/", "alias/", or "config/"`);
        }
      },
    );
    this.providerDb[key] = once(
      () => this.fillToolBox(toolKeys).then(
        (toolBox) => lambda(toolBox),
      ),
    );
  }
}

export default AppContext;
