import * as i18next from 'i18next/dist/cjs/i18next.js';

import AppContext from '../../common/appContext/appContext.js';
import { configure, providerName } from '../../common/appContext/i18n.js';
import { Provider } from '../../common/provider.js';

type Ii18n = i18next.i18n;
export { providerName, Ii18n };

configure(i18next, [`${__dirname}/../../common/appContext/i18n`]);

export function getI18n() {
  return AppContext.get().then(
    (cx) => cx.getProvider(providerName),
  ).then(
    (provider: Provider<Ii18n>) => provider.get(),
  );
}
