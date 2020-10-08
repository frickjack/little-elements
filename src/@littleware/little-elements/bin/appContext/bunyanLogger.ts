import { createLogger, LogLevelString } from "bunyan";

import { Logger } from '../../common/appContext/logging.js';
import AppContext, { getTools, ConfigEntry } from '../../common/appContext/appContext.js';
import { Provider, singletonProvider } from '../../common/provider.js';

export const providerName = 'driver/littleware/little-elements/bin/appContext/bunyanLogger';

const defaultConfig = {
    logLevel: "trace"
};

AppContext.get().then(
    (cx) => {
        cx.putProvider(providerName,
            { "config": "config/littleware/logging" },
            async (toolBox) => {
                const systemConfigs = await getTools(toolBox).then(
                    tools => tools.config as ConfigEntry
                );
                const config = { ...defaultConfig, ...systemConfigs.defaults, ...systemConfigs.overrides };
                const log = createLogger({ name: "little-app", level: config.logLevel as LogLevelString });
                const provider:Provider<Logger> = singletonProvider(() => log);
                return provider
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
