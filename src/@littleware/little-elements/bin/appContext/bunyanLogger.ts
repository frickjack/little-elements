import { createLogger } from "bunyan";

import { Logger } from '../../common/appContext/logging.js';
import AppContext from '../../common/appContext/appContext.js';
import { Provider, singletonProvider } from '../../common/provider.js';

const log = createLogger({ name: "little-app" });

export const providerName = 'driver/littleware/little-elements/bin/appContext/bunyanLogger';

AppContext.get().then(
    (cx) => {
        const provider:Provider<Logger> = singletonProvider(() => log);
        cx.putProvider(providerName,
            { "config": "config/littleware/logging" },
            () => provider);
    }
);

export async function getLogger():Promise<Logger> {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<Logger>) => provider.get()
    );
}
