import * as i18n from "../../../../../i18next/dist/esm/i18next.js";
import AppContext from './appContext.js';


/**
 * An AppContext-aware loader for 18next:
 * - https://i18next.com
 * - https://www.npmjs.com/package/i18next
 */
 class I18nHelper {
     /** 
      * See https://stackoverflow.com/questions/25606730/get-current-locale-of-chrome,
      *   https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage/languages
      */
     get locale() {
        return navigator.languages
        ? navigator.languages[0]
        : navigator.language;
     }
 }

 export const driverName = "driver/littleware/i18n/i18next";

 AppContext.get().then(
    async (cx) => {
        const toolKeys = {
            'interface/littleware/fetch': 'fetch'
        };
    }
 );