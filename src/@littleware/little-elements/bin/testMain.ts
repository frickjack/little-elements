import AppContext from "./appContext/appContext.js";
import "../common/appContext/consoleLogger.js";
import "../common/appContext/eventBus.js";
import { configKey as loggingConfigKey } from "../common/appContext/logging.js";

const testConfig = {};

testConfig[loggingConfigKey] = {
    logLevel: "trace"
};

AppContext.build(
    { 
        configHref: [ "generic" ],
        loadConfig: () => Promise.resolve(testConfig)
    }
).then(
    cx => {
        console.log("starting the app");
        return cx.start();
    }
).then(
    () => {
        console.log("the app is started");
    }
);
