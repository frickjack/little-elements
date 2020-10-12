import AppContext, { Dictionary } from '../../common/appContext/appContext.js';
import { Provider, singletonProvider } from '../../common/provider.js';
import { aliasName, SimpleLoader } from '../../common/appContext/simpleLoader.js';


/**
 * Simple loader for loading local files or fetching
 * from the network.
 * TODO: extend with support for local/session storage ...
 * 
 * @param path treated as simple path if does not start with
 *           file:/// or https?://
 * @return text string - caller must convert to json
 *        if necessary via JSON.parse() or whatever
 */
export function loadConfig(path:string): Promise<Dictionary<any>> {
    return fetch(path).then(res => res.json());
}

export const providerName = 'driver/littleware/little-elements/lib/appContext/simpleLoader';


AppContext.get().then(
    (cx) => {
        const provider:Provider<SimpleLoader> = singletonProvider(() => ({ loadConfig }));
        cx.putProvider(providerName, {}, () => provider);
        cx.putAlias(aliasName, providerName);
    }
);

export async function getLoader():Promise<SimpleLoader> {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<SimpleLoader>) => provider.get()
    );
}
