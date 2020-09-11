import nodeFetch = require('node-fetch');
import fs = require('fs');

import AppContext from '../../common/appContext/appContext.js';
import { Provider, singletonProvider } from '../../common/provider.js';

/**
 * Simple loader for loading local files or fetching
 * from the network.
 * 
 * @param path treated as simple path if does not start with
 *           file:/// or https?://
 * @return text string - caller must convert to json
 *        if necessary via JSON.parse() or whatever
 */
export function fetch(path:string): Promise<string> {
    if (path.match(/^https?:\/\/(.+)$/)) {
        return nodeFetch(path).then(res => res.text());
    }
    return new Promise(
        (resolve, reject) => {
            fs.readFile(
                path,
                'utf8',
                (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }
            );
        }
    );
}

export const providerName = 'driver/littleware/little-elements/bin/appContext/simpleLoader';

export interface SimpleLoader {
    fetch(path:string);
};

AppContext.get().then(
    (cx) => {
        const provider:Provider<SimpleLoader> = singletonProvider(() => ({ fetch }));
        cx.putProvider(providerName, {}, () => provider);
    }
);

export async function getLoader():Promise<SimpleLoader> {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<SimpleLoader>) => provider.get()
    );
}
