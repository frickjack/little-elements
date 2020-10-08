import "../../../../../i18next/dist/esm/i18next.js";

import { Barrier } from '../../common/mutexHelper.js';
import AppContext from '../../common/appContext/appContext.js';
import "../../common/appContext/i18n.js";
import { providerName as consoleProvider } from '../../common/appContext/consoleLogger.js';
import { aliasName as loggingAlias } from '../../common/appContext/logging.js';
import { loadConfig } from './simpleLoader.js';



/**
 * Custom element for configuring the application
 * context.
 */
export class LittleAppContext extends HTMLElement {
    
    constructor() {
        super();
    }
    
    /**
     *  Monitor the 'name' attribute for changes, see:
     *     https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
     */
    static get observedAttributes(): string[] { 
        return [
            //"config-href"
            ]; 
    }


    /** Property backed by "config-href" attribute */
    get configHref(): string[] {
        return this.getAttribute("config-href").split(/,\s*/);
    }

    private _appCx:Barrier<AppContext> = null;

    private bootstrap():Promise<AppContext> {
        if (this._appCx) { return this._appCx.wait(); }
        this._appCx = new Barrier<AppContext>();
        AppContext.build(
            {
                configHref: this.configHref,
                loadConfig
            }
        ).then(
            (appCx) => this._appCx.signal(appCx)
        );
        return this._appCx.wait();
    }
    
    public connectedCallback(): void {
        this.bootstrap();
    }
  
    get appCx(): Promise<AppContext> {
        return this.bootstrap();
    }
}

window.customElements.define("lw-app-context", LittleAppContext);

export default AppContext;


AppContext.get().then(
    (cx) => {
        cx.putAlias(loggingAlias, consoleProvider);
    }
);
