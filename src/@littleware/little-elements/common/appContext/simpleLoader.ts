import AppContext, { Dictionary } from './appContext.js';
import { Provider } from '../provider.js';


export const aliasName = 'alias/littleware/little-elements/common/appContext/simpleLoader';

export interface SimpleLoader {
    loadConfig(path:string):Promise<Dictionary<Dictionary<any>>>;
};


export async function getLoader():Promise<SimpleLoader> {
    return AppContext.get().then(
        cx => cx.getProvider(aliasName)
    ).then(
        (provider:Provider<SimpleLoader>) => provider.get()
    );
}
