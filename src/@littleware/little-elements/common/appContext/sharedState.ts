import AppContext, { Dictionary, getTools } from './appContext.js';
import { deepCopy } from '../mutexHelper.js';
import { Provider, singletonProvider } from '../provider.js';
import { aliasName as logKey, Logger } from './logging.js';
import { providerName as busKey, EventBus } from './eventBus.js';

interface Tools {
    logger: Logger;
    bus: EventBus;
}

const empty = Object.freeze({});

export class SharedState {
    private tools:Tools = null;
    private frozenState:Dictionary<Object> = {};

    constructor(tools:Tools) {
        this.tools = tools;
    }

    // strip leading or traling /
    cleanKey(key:string):string {
        if (key) {
            return key.replace(/(^\/+)|(\/+$)/g, "");
        }
        throw new Error(`Invalid key: ${key}`);
    }

    getState(key:string):Promise<Object> {
        const cleanKey = this.cleanKey(key);
        return Promise.resolve(this.frozenState[cleanKey] || empty);
    }

    changeState(key:string, handler:(Object) => Object|Promise<Object>):Promise<Object> {
        const cleanKey = this.cleanKey(key);
        return this.getState(cleanKey).then(
            v1 => Promise.resolve(handler(deepCopy(v1))).then(
                v2 => ({v1, v2: deepCopy(v2, true)})
            )
        ).then(
            ({v1, v2}) => {
                this.frozenState[cleanKey] = v2;
                this.tools.bus.dispatch(`lw-sc:${cleanKey}`, { old: v1, new: v2 });
                return v2;
            }
        );
    }
}

export const providerName = 'driver/littleware/little-elements/common/appContext/sharedState';

AppContext.get().then(
    (cx) => {
        cx.putProvider(providerName, { logger: logKey, bus: busKey },
            async (toolBox) => {
                const tools:Tools = await getTools(toolBox) as Tools;
                return singletonProvider(() => new SharedState(tools));
            }
        );
    }
);

export async function getSharedState():Promise<SharedState> {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<SharedState>) => provider.get()
    );
}
