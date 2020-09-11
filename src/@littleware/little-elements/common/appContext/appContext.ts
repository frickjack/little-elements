import { Barrier } from '../../common/mutexHelper.js';
import { Provider } from '../../common/provider.js';


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

export interface ConfigEntry {
    defaults: Dictionary<any>;
    overrides: Dictionary<any>;
}

export interface AppContextConfig {
    configHref: string[];
    fetch: (href:string) => Promise<Object>;
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
    
    private providerDb:Dictionary<Promise<Provider<any>>> = {};

    /**
     * Register a new provider.
     * 
     * @param keyIn automatically prepended with "driver/" if not already
     * @param toolKeys 
     * @param lambda 
     */
    putProvider(keyIn:string, toolKeys:Dictionary<string>, lambda:ToolFactory<any>) {
        const key = keyIn.replace(/^\/*(driver\/+)*/, 'driver/');
        if (this.providerDb.hasOwnProperty(key)) {
            throw new Error(`provider already registered for ${key}`);
        }
        this.providerDb[key] = this.startBarrier.wait().then(
            () => toPromise(
                join(
                    split(toolKeys).map(
                        (kv) => {
                            const rawKey = kv.k;
                            const alias = kv.v;
                            const provider = this.providerDb[rawKey];
                            if (!provider) {
                                throw new Error(`failed to configure provider ${key} - missing dependency ${rawKey}`);
                            }
                            return { k: rawKey, v: provider }
                        }
                    )
                )
            )   
        ).then(
            (toolBox) => lambda(toolBox)
        );
    }

    /**
     * 
     * @param key must start with driver/, interface/, or config/
     */
    getProvider<T>(key:string):Promise<Provider<T>> {
        return this.startBarrier.wait().then(
            () => this.providerDb[key]
        );
    }

    /**
     * Put a default configuration into the context.
     * Note that config overrides loaded at runtime
     * overwrite a default put into the context. 
     * This method is intended for use by modules that
     * want to register default configuration at 
     * startup time.
     * 
     * @param contextIn 
     * @param key 
     */
    putDefaultConfig(key:string, value:Dictionary<any>):void {
        this.defaultConfigs[key] = value;
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
    private startBarrier = new Barrier<void>();

    /**
     * Trigger context launch - invoke once
     * from main()
     */
    start(): Promise<void> {
        if (!this.startBarrier.signal()) {
            throw new Error('Context perviously started');
        }
        return this.startBarrier.wait();
    }

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