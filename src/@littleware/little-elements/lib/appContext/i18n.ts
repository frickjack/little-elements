import "../../../../../i18next/i18next.min.js";
import { i18n } from "../../../../../i18next/i18next.min.js";

import AppContext from '../../common/appContext/appContext.js';
import { providerName, configure } from "../../common/appContext/i18n.js";
import { Provider } from '../../common/provider';

declare var i18next:i18n;
type Ii18n = i18n;
export { providerName, Ii18n };

configure(i18next, [`${new URL(import.meta.url).pathname.replace(/\/[^/]+$/, '')}/../../common/appContext/i18n`]);

export function getI18n() {
    return AppContext.get().then(
        cx => cx.getProvider(providerName)
    ).then(
        (provider:Provider<Ii18n>) => provider.get()
    );
}
