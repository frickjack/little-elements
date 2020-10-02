import { singletonProvider } from "../../../../../commonjs/common/provider";
import * as i18next from "../../../../../i18next/dist/esm/i18next.js";
import AppContext, { ConfigEntry, Dictionary, getTools } from './appContext.js';
import { aliasName as logKey, Logger } from './logging.js';
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
    config: Dictionary<any>;
    logger: Logger;
};

AppContext.get().then(
    async (cx) => {
        cx.putProvider(providerName, toolKeys, 
            (toolBox) => {
                return singletonProvider(
                    async () => {
                        let tools = await getTools(toolBox);
                        const configEntry:ConfigEntry = tools.config;
                        
                        const config = {
                            ... {
                                locale: getLocale(),
                                debug: false,
                                resourceFolders: []
                            }, 
                            ... configEntry.defaults,
                            ... configEntry.overrides
                        } as Config;
                        
                        const lang = (config.locale || "en").replace(/-.+$/, '');
                                
                        return i18next.init({ lng: config.locale }).then(
                            () => {
                                const loader = tools.loader as SimpleLoader;
                                return Promise.all(
                                        config.resourceFolders.map(
                                            f => loader.loadConfig(
                                                        `${f}/${lang}.json`
                                                    ).catch(
                                                        () => {
                                                            tools.log.trace(`failed to load i18n resources from ${f}/${lang}.json`);
                                                            return {};
                                                        }
                                                    )
                                    )
                                );
                            }
                        ).then(
                            (resourceList:any[]) => {
                                recourseList.foreach(
                                    (res) => {

                                    }
                                )
                                i18next.addResource(i18next.language, 'little-elements', {}, true, true);
                            }
                        )
                    }
                );
            }
        );
    }
);

AppContext.get().then(
    cx => cx.onStart({ i18n: providerName },
        async (toolBox) => {
            let tools = await getTools(toolBox);
            // maybe not necessary ? tools.i18n.loadNamespaces(['little-elements'])           
        })
)