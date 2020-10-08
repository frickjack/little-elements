import i18next, { i18n } from "i18next/dist/cjs/i18next.js";

import AppContext from '../../common/appContext/appContext.js';
import { providerName, configure } from "../../common/appContext/i18n.js";
import { Provider } from '../../common/provider.js';

configure(i18next);

export function getI18n() {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<i18n>) => provider.get()
    );
}