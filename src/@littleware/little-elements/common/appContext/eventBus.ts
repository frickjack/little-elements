import AppContext, { Dictionary, getTools } from './appContext.js';
import { deepCopy } from '../mutexHelper.js';
import { Provider, singletonProvider } from '../provider.js';
import { aliasName as logKey, Logger } from './logging.js';

export interface Event {
    evType: string;
    data: any;
}

type Listener = (Event) => any;


interface Tools {
    logger: Logger;
}

export class EventBus {
    private listenerDb:Dictionary<Listener[]> = {};
    private tools:Tools = null;
    
    constructor(tools:Tools) {
        this.tools = tools;
    }

    /**
     * Attach a listener for any event with the given type prefix
     * 
     * @param evTypePrefix to listen for
     * @param listener 
     * @return true if listener added, false if listener already present
     */
    addListener(evTypePrefix:string, listener:Listener):boolean {
        let listenerList = this.listenerDb[evTypePrefix];
        if (!listenerList) {
            listenerList = [];
            this.listenerDb[evTypePrefix] = listenerList;
        }
        if (listenerList.find(it => it === listener)) {
            return false;
        }
        listenerList.push(listener);
        return true;
    }

    removeListener(evTypePrefix:string, listener:Listener):boolean {
        const listenerList = this.listenerDb[evTypePrefix];
        if (!listenerList) {
            return false;
        }
        this.listenerDb[evTypePrefix] = listenerList.filter(it => it !== listener);
        return this.listenerDb[evTypePrefix].length !== listenerList.length;
    }

    dispatch(evType:string, data:any) {
        const ev:Event = deepCopy({ evType, data }, true);
        
        Object.entries(this.listenerDb).reduce(
                (acc, [listenerPrefix, listeners]) => {
                    if (evType.startsWith(listenerPrefix)) {
                        acc = acc.concat(listeners);
                    }
                    return acc;
                }, []
            ).forEach(
                (lambda:Listener) => Promise.resolve('ok').then(() => lambda(ev))
            );
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
