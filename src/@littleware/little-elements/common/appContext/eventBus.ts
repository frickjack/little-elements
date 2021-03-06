import { deepCopy } from '../mutexHelper.js';
import { Provider, singletonProvider } from '../provider.js';
import AppContext, { Dictionary, getTools } from './appContext.js';
import { aliasName as logKey, Logger } from './logging.js';

export interface BusEvent {
  evType: string;
  data: any;
}

export type BusListener = (BusEvent) => any;

interface Tools {
  logger: Logger;
}

export class EventBus {
  private listenerDb: Dictionary<BusListener[]> = {};

  private tools: Tools = null;

  constructor(tools: Tools) {
    this.tools = tools;
  }

  /**
     * Attach a listener for any event with the given type prefix
     *
     * @param evTypePrefix to listen for
     * @param listener
     * @return true if listener added, false if listener already present
     */
  public addListener(evTypePrefix: string, listener: BusListener): boolean {
    let listenerList = this.listenerDb[evTypePrefix];
    if (!listenerList) {
      listenerList = [];
      this.listenerDb[evTypePrefix] = listenerList;
    }
    if (listenerList.find((it) => it === listener)) {
      return false;
    }
    listenerList.push(listener);
    return true;
  }

  public removeListener(evTypePrefix: string, listener: BusListener): boolean {
    const listenerList = this.listenerDb[evTypePrefix];
    if (!listenerList) {
      return false;
    }
    this.listenerDb[evTypePrefix] = listenerList.filter((it) => it !== listener);
    return this.listenerDb[evTypePrefix].length !== listenerList.length;
  }

  public dispatch(evType: string, data: any) {
    const ev: BusEvent = deepCopy({ evType, data }, true);

    Object.entries(this.listenerDb).reduce(
      (acc, [listenerPrefix, listeners]) => {
        if (evType.startsWith(listenerPrefix)) {
          acc = acc.concat(listeners);
        }
        return acc;
      }, [],
    ).forEach(
      (lambda: BusListener) => Promise.resolve('ok').then(() => lambda(ev)),
    );
  }

  static get providerName() { return 'driver/littleware/little-elements/common/appContext/eventBus'; }
}

AppContext.get().then(
  (cx) => {
    cx.putProvider(EventBus.providerName, { logger: logKey },
      async (toolBox) => {
        const tools: Tools = await getTools(toolBox) as Tools;
        return singletonProvider(() => new EventBus(tools));
      });
  },
);

export async function getBus(): Promise<EventBus> {
  return AppContext.get().then(
    (cx) => cx.getProvider(EventBus.providerName),
  ).then(
    (provider: Provider<EventBus>) => provider.get(),
  );
}
