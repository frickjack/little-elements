/**
 * Define basic logging interface - stolen from bunyan:
 *     https://www.npmjs.com/package/bunyan
 */

import { Provider } from '../provider.js';
import AppContext from './appContext.js';

export interface Logger {
  fatal(info: any, msg?: string);
  error(info: any, msg?: string);
  warn(info: any, msg?: string);
  info(info: any, msg?: string);
  debug(info: any, msg?: string);
  trace(info: any, msg?: string);
}

export const configKey = 'littleware/logging';
export const aliasName = 'alias/littleware/little-elements/common/appContext/Logger';

export async function getLogger(): Promise<Logger> {
  return AppContext.get().then(
    (cx) => cx.getProvider(aliasName),
  ).then(
    (provider: Provider<Logger>) => provider.get(),
  );
}
