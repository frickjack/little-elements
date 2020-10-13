import i18next, { i18n } from "../../../../../node_modules/i18next/dist/esm/i18next";

import AppContext from '../../common/appContext/appContext';
import { providerName, configure } from "../../common/appContext/i18n";
import { Provider } from '../../common/provider';

configure(i18next, [`${new URL(import.meta.url).pathname}/../../common/appContext/i18n`]);

export function getI18n() {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<i18n>) => provider.get()
    );
}
