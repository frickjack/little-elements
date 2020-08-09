import {html, render, TemplateResult} from "../../../../../lit-html/lit-html.js";
import {singleton as styleHelper} from "../styleGuide/styleGuide.js";
import {css} from "./authMgr.css.js";


/**
 * 
 * @param model for instrumenting the template
 */
function templateFactory(model: LittleAuthMgr): TemplateResult {
    return html`
<div class="pure-menu pure-menu-horizontal lw-auth-mgr lw-auth-mgr_login">
    <ul class="pure-menu-list">
        <li class="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
            <a href="#" id="menuLink1" class="pure-menu-link">Sign In</a>
            <ul class="pure-menu-children">
                <li class="pure-menu-item lw-auth-mgr__item lw-auth-mgr__item_logout">
                    <a href="#" class="pure-menu-link">Logout</a>
                </li>
                <li class="pure-menu-item lw-auth-mgr__item lw-auth-mgr__item_login">
                    <a href="#" class="pure-menu-link">Login</a>
                </li>
                <li class="pure-menu-item lw-auth-mgr__item lw-auth-mgr__item_logout">
                    <a href="#" class="pure-menu-link">Account Info</a>
                </li>
            </ul>
        </li>
    </ul>
</div>    
    `;
}
  

export class LittleAuthMgr  extends HTMLElement {
    
    /**
     *  Monitor the 'name' attribute for changes, see:
     *     https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
     */
    static get observedAttributes(): string[] { 
        return [
            "login-endpoint", "login-callback",
            "logout-endpoint", "logout-callback",
            "userinfo-endpoint"
            ]; 
    }


    /** Property backed by "login-endpoint" attribute */
    get loginEndpoint(): string {
        return this.getAttribute("login-endpoint");
    }

    /** 
     * Property backed by "login-callback" attribute,
     * but defaults to the path from which the
     * login flow launches if the attribute is not set
     */
    get loginCallback(): string {
        return this.getAttribute("login-callback");
    }

    public connectedCallback(): void {
        this.render();
    }

    public disconnectedCallback(): void {
        // console.log( "Disconnected!" );
    }
  
    public attributeChangedCallback(attrName?: string, oldVal?: string, newVal?: string): void {
        // console.log( "Attribute change! " + attrName );
        this.render();
    }
  
    // Render element DOM by returning a `lit-html` template.
    render() {
        render(
            templateFactory(this),
            this
        );
    }
}

window.customElements.define( "lw-auth-mgr", LittleAuthMgr );

export default LittleAuthMgr;

styleHelper.componentCss.push(css);
styleHelper.render();
