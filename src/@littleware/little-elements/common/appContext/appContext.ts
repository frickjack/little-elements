import { once, pmap, Barrier } from '../../common/mutexHelper.js';
import { passThroughProvider, Provider } from '../../common/provider.js';


export interface Dictionary<T> {
    [key:string]: T;
}

/**
 * Extract a subset from a larger dictionary
 * 
 * @param all 
 * @param keyList
 * @return subset 
 */
export function lookup<T>(all:Dictionary<T>, keyList:string[]):Dictionary<T> {
    return keyList.map(k => ({ k, v: all[k] })
        ).filter(kv => !!kv.v
        ).reduce(
            (acc, {k,v}) => {
                acc[k] = v;
                return acc;
            }, {}
        );
}


export function join<T>(kvList:{ k:string, v:T }[]): Dictionary<T> {
    return kvList.reduce(
        (acc, { k, v }) => {
            acc[k] = v;
            return acc;
        }, {}
    );
}

export function split<T>(dict:Dictionary<T>):{ k:string, v:T }[] {
    return Object.entries(dict).map(
        ([k, v]) => ({ k, v })
    );
}

/**
 * Convert a dictionary of promises to a promise
 * for a dictionary
 */
export function toPromise<T>(dict:Dictionary<Promise<T>>):Promise<Dictionary<T>> {
    return Promise.all(
        split(dict).map(
            kv => kv.v.then(v => ({ k: kv.k, v }))
        )
    ).then(
        kvList => join(kvList)
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
    loadConfig: (href:string) => Promise<Dictionary<Dictionary<any>>>;
}

export type ToolBox = Dictionary<Provider<any>>;

export function getTools(tb:ToolBox): Promise<Dictionary<any>> {
    return toPromise(
        join(
            split(tb).map(({ k, v }) => ({ k, v: v.get() }))
        )
    );
}

export type ToolFactory<T> = (toolbox:ToolBox) => Provider<T>;

export interface ProviderInfo {
    key:string;
    toolKeys:Dictionary<string>;
    lambda:ToolFactory<any>;
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
    config:AppContextConfig;

    /**
     * Constructor takes an immutable configuration
     */
    constructor(config:AppContextConfig) {
        this.config = {... config};
    }

    // promise fetching translation overrides
    private i18nLoad:Promise<ConfigDb> = null;

    private defaultConfigs:ConfigDb = {};
    private overrideConfigs:ConfigDb = {};

    /**
     * Load the remote configuration specified
     * by the constructor injected properties
     */
    private init():Promise<void> {
        return Promise.resolve();
    }
    
    // Dictionary of lazy-initialized providers.
    // The Provider factory is not invoked until
    // the first request for the provider.
    private providerDb:Dictionary<() => Provider<any>> = {};
    private allToolKeys:Set<string> = new Set();

    private fillToolBox(toolKeys:Dictionary<string>):ToolBox {
        const toolBox = join(
            split(toolKeys).map(
                (kv) => {
                    const rawKey = kv.v;
                    const alias = kv.k;
                    const providerFactory = this.providerDb[rawKey];
                    if (!providerFactory) {
                        throw new Error(`failed to fill toolbox - missing dependency ${rawKey}`);
                    }
                    return { k: alias, v: providerFactory() }
                }
            )
        );
        return toolBox;
    }

    private putProviderOrAlias(key:string, toolKeys:Dictionary<string>, lambda:ToolFactory<any>) {
        if (this.providerDb.hasOwnProperty(key)) {
            throw new Error(`provider already registered for ${key}`);
        }
        Object.values(toolKeys).forEach(
            (k) => {
                if (k.startsWith('driver/') || k.startsWith('alias/') || k.startsWith('config/')) {
                    if (k.startsWith('config/') && !this.providerDb.hasOwnProperty(k)) {
                        // go ahead and register a provider that retrieves the configuration
                        const configProvider = passThroughProvider(() => this.getConfig(k.replace(/^config\//, '')));
                        this.providerDb[k] = () => configProvider;
                    }
                    this.allToolKeys.add(k);
                } else {
                    throw new Error(`Provider ${key} requested invalid tool key ${k} - must start with "driver/", "alias/", or "config/"`);
                }
            }
        );
        this.providerDb[key] = once(
            () => {
                const toolBox = this.fillToolBox(toolKeys); 
                return lambda(toolBox);
            }
        );
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
    putProvider(keyIn:string, toolKeys:Dictionary<string>, lambda:ToolFactory<any>) {
        const key = keyIn.replace(/^\/*(driver\/+)*/, 'driver/');
        this.putProviderOrAlias(key, toolKeys, lambda);
    }

    /**
     * Register a lambda to run at startup
     * 
     * @param toolKeys to inject into lambda - alias to rawKey
     * @param lambda 
     */
    onStart<T>(toolKeys:Dictionary<string>, lambda:(ToolBox) => T|Promise<T>):Promise<T> {
        return this.startBarrier.wait().then(
            () => {
                const toolBox = this.fillToolBox(toolKeys); 
                return lambda(toolBox);
            }
        );
    }

    /**
     * Register a new provider.
     * 
     * @param alias automatically prepended with "alias/" if not already
     * @param driverName automatically prepended with "driver/" if not already
     */
    putAlias(alias:string, driverName:string) {
        const key = alias.replace(/^\/*(alias\/+)*/, 'alias/');
        const tools = {};
        tools["driver"] = driverName;

        this.putProviderOrAlias(key, tools, 
            (toolBox) => toolBox["driver"]
            );
    }

    /**
     * 
     * @param key must start with driver/, interface/, or config/
     */
    getProvider<T>(key:string):Promise<Provider<T>> {
        return this.startBarrier.wait().then(
            () => {
                let factory = this.providerDb[key];
                if (!factory && key.startsWith('config/') && !this.providerDb.hasOwnProperty(key)) {
                    // go ahead and register a provider that retrieves the configuration
                    const configKey = key.replace(/^config\//, '');
                    const configProvider = passThroughProvider(() => this.getConfig(configKey));
                    factory = () => configProvider;
                    this.providerDb[key] = factory;
                }

                if (!factory) {
                    throw new Error(`no provider registered for key ${key}`);
                }
                return factory();
            }
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
    putDefaultConfig(key:string, value:Dictionary<any>):void {
        const configKey = key.replace(/^config\//, '');
        const providerKey = `config/${configKey}`;
        const currentConfig = this.defaultConfigs[configKey] || {};
        this.defaultConfigs[configKey] = { ...currentConfig, ...value };
        if (!this.providerDb.hasOwnProperty(providerKey)) {
            // go ahead and register a provider that retrieves the configuration
            const configProvider = passThroughProvider(() => this.getConfig(configKey));
            this.providerDb[providerKey] = () => configProvider;
        }
    }

    async getConfig(key:string):Promise<ConfigEntry> {
        return this.startBarrier.wait().then(
            () => (
                { 
                    defaults: this.defaultConfigs[key] || {},
                    overrides: this.overrideConfigs[key] || {},
                }
            )
        );
    }
    
    private static singletonBarrier:Barrier<AppContext> = new Barrier<AppContext>();
    private startBarrier = new Barrier<string[]>();

    /**
     * Trigger context launch - invoke once
     * from main().
     * 
     * @returns a list of tools that
     * are required by registered providers, but
     * unbound.
     */
    start:() => Promise<string[]> = once(
        async () => {
            let configList:Dictionary<Dictionary<any>>[] = await pmap(
                this.config.configHref,
                (url) => this.config.fetch(url)
            );
            this.overrideConfigs = configList.reduce(
                (acc, db) => Object.assign(acc, db),
                {}
            );
            // register a provider for any keys not already
            Object.keys(this.overrideConfigs).forEach(
                (configKey) => {
                    const providerKey = `config/${configKey}`;
                    if (!this.providerDb.hasOwnProperty(providerKey)) {
                        // go ahead and register a provider that retrieves the configuration
                        const configProvider = passThroughProvider(() => this.getConfig(configKey));
                        this.providerDb[providerKey] = () => configProvider;
                    }
                }
            );
            const unboundTools = [ ... this.allToolKeys ].filter(k => !this.providerDb.hasOwnProperty(k));   
            if (!this.startBarrier.signal(unboundTools)) {
                throw new Error('Context perviously started');
            }
            return this.startBarrier.wait();
        },
        () => { throw new Error('Context perviously started') }
    );

    static build(config:AppContextConfig):Promise<AppContext> {
        if (AppContext.singletonBarrier.state !== 'unresolved') {
            throw new Error('Singleton AppContext already initialized'); 
        }
        const singleton = new AppContext(config);
        AppContext.singletonBarrier.signal(
            singleton.init().then(() => singleton)
        );
        return AppContext.singletonBarrier.wait();
    }

    static get():Promise<AppContext> { return AppContext.singletonBarrier.wait(); }
}

export default AppContext;