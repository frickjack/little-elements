import AppContext from "../../common/appContext/appContext.js";
import { ConsoleLogger } from "../../common/appContext/consoleLogger.js";
import "../../common/appContext/eventBus.js";
import "../../common/appContext/i18n.js";
import { aliasName as loggingAlias } from "../../common/appContext/logging.js";
import "../../common/appContext/sharedState.js";
import { once } from "../../common/mutexHelper.js";
import "./i18n.js";
import { loadConfig } from "./simpleLoader.js";

/**
 * Custom element for configuring the application
 * context.
 */
export class LittleAppContext extends HTMLElement {

    /**
     *  Monitor the 'name' attribute for changes, see:
     *     https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
     */
    static get observedAttributes(): string[] {
        return [
            // "config-href"
            ];
    }

    /**
     * Property backed by "config-href" attribute,
     * filtered to replace HOSTNAME with location.hostname
     */
    get configHref(): string[] {
        const attr = this.getAttribute("config-href");
        if (attr) {
            return attr.split(/,\s*/
                ).filter(it => it.match(/\S/)
                ).map(it => it.replace(/HOSTNAME/g, location.hostname)
                );
        }
        return [];
    }

    /** Property backed by "main-module" attribute */
    get mainModule(): string {
        return this.getAttribute("main-module");
    }

    get appCx(): Promise<AppContext> {
        return this.bootstrap();
    }

    private bootstrap: () => Promise<AppContext> = once(
        () => AppContext.build(
            {
                configHref: this.configHref,
                loadConfig,
            },
        ).then(
            (cx) => {
                const mainMod = this.mainModule;
                if (! mainMod) {
                    // assume the caller will load the module herself,
                    // and start the context
                    return cx;
                }
                let modPath = mainMod;
                if (mainMod.startsWith(".")) {
                    // assume it's a path relative to location.href
                    modPath = new URL(location.href).pathname.replace(/\/[^/]+$/, "") + `/${mainMod}`;
                }
                return import(modPath).then(() => cx);
            },
        ).then(
            // clear the loading shell if present
            (cx) => {
                const shellPromise = globalThis.littleShell ?
                    globalThis.littleShell.clear() as Promise<string> :
                    Promise.resolve("ok");
                return shellPromise.then(() => cx);
            },
        ).then(
            (cx) => cx.start().then(() => cx),
        ),
    );

    constructor() {
        super();
    }

    public connectedCallback(): void {
        this.bootstrap();
    }
}

window.customElements.define("lw-app-context", LittleAppContext);

export default AppContext;
export * from "../../common/appContext/appContext.js";

AppContext.get().then(
    (cx) => {
        cx.putAlias(loggingAlias, ConsoleLogger.providerName);
    },
);

(() => {
    const workerPath = `${new URL(import .meta.url).pathname.replace(/\/[^/]+$/, "")}/service-worker.js`;
    navigator.serviceWorker.register(workerPath);
})();
