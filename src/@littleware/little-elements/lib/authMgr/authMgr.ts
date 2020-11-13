import { html, render, TemplateResult } from "../../../../../lit-html/lit-html.js";
import { singleton as styleHelper } from "../styleGuide/styleGuide.js";
import AppContext, { getTools } from '../../common/appContext/appContext.js';
import { Ii18n, providerName as i18nProvider } from '../appContext/i18n.js';
import { Logger, aliasName as loggerAlias } from '../../common/appContext/logging.js';
import { css } from "./authMgr.css.js";

interface Tools {
    i18n: Ii18n;
    log: Logger;
}

let tools: Tools = null; // initialized below

/**
 * Get default translations from common/authMgr/i18n/en.json
 * 
 * @param model for instrumenting the template
 */
function templateFactory(model: LittleAuthMgr): TemplateResult {
    return html`
<div class="pure-menu pure-menu-horizontal lw-auth-mgr lw-auth-mgr_login">
    <ul class="pure-menu-list">
        ${model.user === "anonymous" ? html`
          <li class="pure-menu-item">
            <a href="#/authMgr/login" class="pure-menu-link">${tools.i18n.t('login')}</a>
          </li>
        ` : html`
          <li class="pure-menu-item pure-menu-has-children">
            <span class="pure-menu-link">${model.user}</span>            
            <ul class="pure-menu-children">
                <li class="pure-menu-item lw-auth-mgr__item lw-auth-mgr__item_logout">
                    <a href="#/authMgr/logout" class="pure-menu-link">${tools.i18n.t('logout')}</a>
                </li>
                <li class="pure-menu-item lw-auth-mgr__item lw-auth-mgr__item_logout">
                    <a href="#/authMgr/accountInfo" class="pure-menu-link">${tools.i18n.t('accountInfo')}</a>
                </li>
            </ul>
          </li>
            `}
    </ul>
</div>
`;
}


export class LittleAuthMgr extends HTMLElement {
    private userVal:string = "anonymous";

    constructor() {
        super();
    }

    get user() { return this.userVal; }
    set user(value:string) { 
        this.userVal = value;
        this.render();
    }

    public connectedCallback(): void {
        this.render();
    }

    public disconnectedCallback(): void {
        // console.log( "Disconnected!" );
    }
    
    // Render element DOM by returning a `lit-html` template.
    render() {
        render(
            templateFactory(this),
            this
        );
    }
}

AppContext.get().then(
    (cx) => {
        cx.onStart(
            { i18n: i18nProvider, log: loggerAlias },
            async (toolBox) => {
                tools = await getTools(toolBox) as Tools;
                window.customElements.define("lw-auth-mgr", LittleAuthMgr);
                styleHelper.componentCss.push(css);
                styleHelper.render();        
            }
        );
    }
);


export default LittleAuthMgr;

