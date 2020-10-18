import i18next, { i18n } from "../../../../../i18next/dist/esm/i18next.js";

import AppContext from '../../common/appContext/appContext.js';
import { providerName, configure } from "../../common/appContext/i18n.js";
import { Provider } from '../../common/provider';

configure(i18next, [`${new URL(import.meta.url).pathname}/../../common/appContext/i18n`]);

export function getI18n() {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<i18n>) => provider.get()
    );
}
