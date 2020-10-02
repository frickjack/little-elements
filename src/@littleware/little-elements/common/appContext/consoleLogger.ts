import AppContext, { ConfigEntry, getTools } from './appContext.js';
import { configKey, Logger } from './logging.js';
import { singletonProvider, Provider } from '../provider.js';


const traceLevel = 1;
const debugLevel = 2;
const infoLevel = 3;
const warnLevel = 4;
const errorLevel = 5;
const fatalLevel = 6;

export function strToLevel(levelStr) {
    const key = (levelStr || 'info').toLowerCase();
    switch (key) {
        case 'fatal':
            return fatalLevel;
        case 'error':
            return errorLevel;
        case 'warn':
            return warnLevel;
        case 'debug':
            return debugLevel;
        case 'trace':
            return traceLevel;
        default:
            return infoLevel;
    }
}

export class ConsoleLogger implements Logger {
    minLevel = 0;

    constructor(minLevel=infoLevel) {
        this.minLevel = minLevel;
    }

    log(level:number, info:any, msg?:string) {
        if (level >= this.minLevel) {
            console.log({ ... info, msg: msg || info.msg });
        }
    }

    fatal(info:any, msg?:string) {
        this.log(fatalLevel, info, msg);
    }

    error(info:any, msg?:string) {
        this.log(errorLevel, info, msg);
    }

    warn(info:any, msg?:string) {
        this.log(warnLevel, info, msg);
    }

    info(info:any, msg?:string) {
        this.log(infoLevel, info, msg);
    }

    debug(info:any, msg?:string) {
        this.log(debugLevel, info, msg);
    }

    trace(info:any, msg?:string) {
        this.log(traceLevel, info, msg);
    }
}


export const providerName = 'driver/littleware/little-elements/common/appContext/consoleLogger';

const defaultConfig = {
    logLevel: "info"
};

interface Tools {
    config: ConfigEntry;
}

AppContext.get().then(
    (cx) => {
        cx.putProvider(providerName, 
            { "config": "config/littleware/logging" },
            (toolBox) => {
                return singletonProvider(
                    async () => {
                        const tools:Tools = await getTools(toolBox) as Tools;
                        const config = { ...defaultConfig, ...tools.config.defaults, ...tools.config.overrides };
                        new ConsoleLogger(strToLevel(config.logLevel));
                    }
                );
            }
        );
    }
);

export async function getLogger():Promise<Logger> {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<Logger>) => provider.get()
    );
}
