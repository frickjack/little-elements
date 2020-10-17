import AppContext, { Dictionary, getTools } from './appContext.js';
import { Provider, singletonProvider } from '../provider.js';
import { aliasName as logKey, Logger } from './logging.js';

export interface Event {
    category: string;
    detail: string;
    data: any;
}

type Listener = (Event) => any;

interface Tools {
    logger: Logger;
}

export class EventBus {
    private listenerDb:Dictionary<Dictionary<Listener[]>> = {};
    private tools:Tools = null;
    
    constructor(tools:Tools) {
        this.tools = tools;
    }

    /**
     * 
     * @param category 
     * @param detail may be a wildcard '*'
     * @param listener 
     * @return true if listener added, false if listener already present
     */
    addListener(category:string, detail:string, listener:Listener):boolean {
        if (!this.listenerDb.hasOwnProperty(category)) {
            this.listenerDb[category] = {};
        }
        if (!this.listenerDb[category].hasOwnProperty(detail)) {
            this.listenerDb[category][detail] = [];
        }
        if (this.listenerDb[category][detail].find(it => it === listener)) {
            return false;
        }
        this.listenerDb[category][detail].push(listener);
        return true;
    }

    removeListener(category:string, detail:string, listener:Listener):boolean {
        if (this.listenerDb.hasOwnProperty(category) && this.listenerDb[category].hasOwnProperty(detail)) {
            const old = this.listenerDb[category][detail];
            this.listenerDb[category][detail] = old.filter(it => it !== listener);
            return this.listenerDb[category][detail].length !== old.length;
        } else {
            return false;
        }        
    }

    dispatch(category:string, detail:string, data:any) {
        if (this.listenerDb.hasOwnProperty(category) && this.listenerDb[category].hasOwnProperty(detail)) {
            this.listenerDb[category][detail].forEach(
                (lambda:Listener) => Promise.resolve('ok').then(() => lambda({ category, detail, data }))
            );
        }
    }

}

export const providerName = 'driver/littleware/little-elements/common/appContext/eventBus';

AppContext.get().then(
    (cx) => {
        cx.putProvider(providerName, { logger: logKey },
            async (toolBox) => {
                const tools:Tools = await getTools(toolBox) as Tools;
                return singletonProvider(() => new EventBus(tools));
            }
        );
    }
);

export async function getBus():Promise<EventBus> {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<EventBus>) => provider.get()
    );
}
