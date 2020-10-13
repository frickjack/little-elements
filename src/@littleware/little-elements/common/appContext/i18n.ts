import AppContext, { ConfigEntry, getTools } from './appContext.js';
import { aliasName as logKey, Logger } from './logging.js';
import { singletonProvider, Provider } from "../provider.js";
import { aliasName as loaderAlias, SimpleLoader } from './simpleLoader.js';


export const providerName = 'driver/littleware/little-elements/common/i18n';

export const configKey = "config/littleware/i18n";

/** 
 * See https://stackoverflow.com/questions/25606730/get-current-locale-of-chrome,
 *   https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/languages
 */
export function getLocale() {
    if (typeof navigator !== "undefined") {
        return navigator.languages
        ? navigator.languages[0]
        : navigator.language;
    }
    return "en";
}

const toolKeys = {
    loader: loaderAlias,
    config: configKey,
    logger: logKey
};

interface Config {
    locale: string;
    debug: boolean;
    resourceFolders: string[];
};

interface Tools {
    loader: SimpleLoader;
    config: ConfigEntry;
    logger: Logger;
};

/**
 * Configure i18next provider - 
 * i18next is imported differently depending on if
 * environment is server side or browser side
 * 
 * @param i18next 
 */
export function configure(i18next, baseResourceFolders:string[]=[]) {
    AppContext.get().then(
        async (cx) => {
            cx.putProvider(providerName, toolKeys, 
                (toolBox) => singletonProvider(
                        async () => {
                            let tools = await getTools(toolBox) as Tools;
                            const configEntry:ConfigEntry = tools.config;
                            
                            const config = {
                                ... {
                                    locale: getLocale(),
                                    debug: false,
                                    resourceFolders: baseResourceFolders
                                }, 
                                ... configEntry.defaults,
                                ... configEntry.overrides
                            } as Config;
                            
                            const lang = (config.locale || "en").replace(/-.+$/, '');
                                    
                            return i18next.init({ lng: config.locale }).then(
                                () => {
                                    const loader = tools.loader as SimpleLoader;
                                    tools.logger.trace(`Loading i18n resources: ${config.resourceFolders.join(', ')}`);
                                    const loadPaths = config.resourceFolders.reduce(
                                        (acc, it) => {
                                            acc.push(`${it}/${lang}.json`);
                                            if (lang !== 'en') {
                                                // load en as a fallback
                                                acc.push(`${it}/${lang}.json`);
                                            }
                                            return acc;
                                        }, []
                                    );
                                    return Promise.all(
                                            loadPaths.map(
                                                path => loader.loadConfig(path).catch(
                                                            () => {
                                                                tools.logger.trace(`failed to load i18n resources from ${path}`);
                                                                return {};
                                                            }
                                                        )
                                        )
                                    );
                                }
                            ).then(
                                (resourceList:any[]) =>
                                    Promise.all(
                                        resourceList.map(
                                            (bundle) => 
                                                Promise.all(
                                                    Object.keys(bundle).map(
                                                        namespace =>
                                                            i18next.addResourceBundle(lang, namespace, bundle[namespace], true, true)
                                                    )
                                                )
                                        )
                                    )
                            ).then(
                                () => i18next
                            ).catch(
                                () => i18next
                            );
                })  // end singletonprovider
            ); // end putprovider
        }
    );
}


export function getI18n() {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<any>) => provider.get()
    );
}
