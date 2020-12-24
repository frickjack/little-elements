import fs = require("fs");
import nodeFetch = require("node-fetch");

import AppContext, { Dictionary } from "../../common/appContext/appContext.js";
import { aliasName, SimpleLoader } from "../../common/appContext/simpleLoader.js";
import { Provider, singletonProvider } from "../../common/provider.js";

/**
 * Simple loader for loading local files or fetching
 * from the network.
 * TODO: enhance to laod command line flags and environment
 *       variables.
 *
 * @param path treated as simple path if does not start with
 *           file:/// or https?://
 * @return parsed json result
 */
export function loadConfig(path: string): Promise<Dictionary<any>> {
    if (path.match(/^https?:\/\/(.+)$/)) {
        return nodeFetch(path).then((res) => res.json());
    }
    return new Promise(
        (resolve, reject) => {
            fs.readFile(
                path,
                "utf8",
                (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        try {
                            resolve(JSON.parse(data));
                        } catch (jsonErr) {
                            reject(jsonErr);
                        }
                    }
                },
            );
        },
    );
}

export const providerName = "driver/littleware/little-elements/bin/appContext/simpleLoader";

AppContext.get().then(
    (cx) => {
        const provider: Provider<SimpleLoader> = singletonProvider(() => ({ loadConfig }));
        cx.putProvider(providerName, {}, () => provider);
        cx.putAlias(aliasName, providerName);
    },
);

export async function getLoader(): Promise<SimpleLoader> {
    return AppContext.get().then(
        (cx) => cx.getProvider(providerName),
    ).then(
        (provider: Provider<SimpleLoader>) => provider.get(),
    );
}
