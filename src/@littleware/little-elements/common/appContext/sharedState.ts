import { deepCopy } from "../mutexHelper.js";
import { Provider, singletonProvider } from "../provider.js";
import AppContext, { Dictionary, getTools } from "./appContext.js";
import { BusEvent, BusListener, EventBus } from "./eventBus.js";
import { aliasName as logKey, Logger } from "./logging.js";

export interface StateEvent extends BusEvent {
    data: {old: object, new: object};
}

export type StateListener = (StateEvent) => any;

interface Tools {
    logger: Logger;
    bus: EventBus;
}

const empty = Object.freeze({});

export class SharedState {
    private tools: Tools = null;
    private frozenState: Dictionary<object> = {};

    constructor(tools: Tools) {
        this.tools = tools;
    }

    // strip leading or traling /
    public cleanKey(key: string): string {
        if (key) {
            return key.replace(/(^\/+)|(\/+$)/g, "");
        }
        throw new Error(`Invalid key: ${key}`);
    }

    //
    // Shortcut for EventBus.addListener
    // Fires a state change as a shortcut, so the listener
    // immediately gets the current value (old and new both set to current)
    //
    public addListener(key: string, listener: StateListener): boolean {
        const busKey = `lw-sc:${this.cleanKey(key)}`;
        if (this.tools.bus.addListener(busKey, listener)) {
            this.getState(key).then(
                (v) => listener({ evType: busKey, data: { old: v, new: v } }),
            );
            return true;
        }
        return false;
    }

    // Shortcut for EventBus.addListener
    public removeListener(key: string, listener: StateListener): boolean {
        return this.tools.bus.removeListener(`lw-sc:${this.cleanKey(key)}`, listener);
    }

    public getState(key: string): Promise<object> {
        const cleanKey = this.cleanKey(key);
        return Promise.resolve(this.frozenState[cleanKey] || empty);
    }

    /**
     * Change the state associated with the given key,
     * and trigger a lw-sc: event if handler()
     * returns an object.  NOOP of handler returns null
     * or undefined.
     *
     * @param key
     * @param handler
     */
    public changeState(key: string, handler: (object) => Object|Promise<object>): Promise<object> {
        const cleanKey = this.cleanKey(key);
        return this.getState(cleanKey).then(
            (v1) => Promise.resolve(handler(deepCopy(v1))).then(
                (v2) => ({v1, v2}),
            ),
        ).then(
            ({v1, v2}) => {
                if (!v2) {
                    return v1;
                }
                v2 = deepCopy(v2, true);
                if (typeof v2 !== "object" || Array.isArray(v2)) {
                    v2 = Object.freeze({thing: v2});
                }
                this.frozenState[cleanKey] = v2;
                this.tools.bus.dispatch(`lw-sc:${cleanKey}`, { old: v1, new: v2 });
                return v2;
            },
        );
    }

    static get providerName() {
        return "driver/littleware/little-elements/common/appContext/sharedState";
    }
}

AppContext.get().then(
    (cx) => {
        cx.putProvider(SharedState.providerName, { logger: logKey, bus: EventBus.providerName },
            async (toolBox) => {
                const tools: Tools = await getTools(toolBox) as Tools;
                return singletonProvider(() => new SharedState(tools));
            },
        );
    },
);

export async function getSharedState(): Promise<SharedState> {
    return AppContext.get().then(
        (cx) => cx.getProvider(SharedState.providerName),
    ).then(
        (provider: Provider<SharedState>) => provider.get(),
    );
}
