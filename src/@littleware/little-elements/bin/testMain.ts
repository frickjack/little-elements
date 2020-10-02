import AppContext from "./appContext/appContext.js";
import "../common/appContext/consoleLogger.js";
import { providerName as i18nProviderName } from "../common/appContext/i18n.js";
import { providerName as bunyanProviderName } from "./appContext/bunyanLogger.js";
import { aliasName as loggingAlias } from "../common/appContext/logging.js";

const testConfig = {};
testConfig[i18nProviderName] = {
    resourceFolders: [ "commonjs/common/appContext/i18n" ]
};

AppContext.build(
    { 
        configHref: [ "generic" ],
        loadConfig: () => Promise.resolve(testConfig)
    }
).then(
    cx => {
        cx.putAlias(loggingAlias, bunyanProviderName);
        console.log("starting the app");
        return cx.start();
    }
).then(
    () => {
        console.log("the app is started");
    }
);
