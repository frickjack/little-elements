/**
 * common/appContext decorator that binds the bunyan logger
 */

import AppContext from "../../common/appContext/appContext.js";
import { aliasName as loggingAlias } from "../../common/appContext/logging.js";

import { providerName as bunyanProvider } from "./bunyanLogger.js";
import "./i18n.js";
import "./simpleLoader.js";

AppContext.get().then(
    (cx) => {
        cx.putAlias(loggingAlias, bunyanProvider);
    }
);

export default AppContext;
