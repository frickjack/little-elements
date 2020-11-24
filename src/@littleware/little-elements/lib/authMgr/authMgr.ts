import { html, render, TemplateResult } from "../../../../../lit-html/lit-html.js";
import { singleton as styleHelper } from "../styleGuide/styleGuide.js";
import AppContext, { getTools } from "../../common/appContext/appContext.js";
import { Ii18n, providerName as i18nProvider } from "../appContext/i18n.js";
import { Logger, aliasName as loggerAlias } from "../../common/appContext/logging.js";
import LittleDropDown from "../littleDropDown/littleDropDown.js";
import { css } from "./authMgr.css.js";

interface Tools {
    i18n: Ii18n;
    log: Logger;
}

const loginContext = "littleware/lib/authMgr/login";
const logoutContext = "littleware/lib/authMgr/logout";


// initialized below - before web component registered
let tools: Tools = null; 


export class LittleAuthMgr extends HTMLElement {
    private userVal:string = "anonymous";
    private loginMenu:LittleDropDown;
    private logoutMenu:LittleDropDown;

    constructor() {
        super();
        this.loginMenu = new LittleDropDown();
        this.loginMenu.setAttribute("context", loginContext);
        this.logoutMenu = new LittleDropDown();
        this.logoutMenu.setAttribute("context", logoutContext);
    }

    get user() { return this.userVal; }
    set user(value:string) { 
        this.userVal = value;
        this.logoutMenu.changeModel(
            (model) => {
                model.root.labelKey = this.userVal;
                return model;
            }
        ).then(
            () => this.render()
        );
    }

    public connectedCallback(): void {
        this.render();
    }

    public disconnectedCallback(): void {
        // console.log( "Disconnected!" );
    }
    
    // Render element DOM by returning a `lit-html` template.
    render() {
        if (this.user && this.user !== "anonymous") {
            if (this.loginMenu.parentElement) {
                this.removeChild(this.loginMenu);
            }
            this.appendChild(this.logoutMenu);
        } else {
            if (this.logoutMenu.parentElement) {
                this.removeChild(this.logoutMenu);
            }
            this.appendChild(this.loginMenu);
        }
    }
}

AppContext.get().then(
    (cx) => {
        cx.putDefaultConfig(loginContext, {
            root: {
                labelKey: "little-elements:anonymous",
                className: "lw-authmgr",
                href: "#whatever",
            },
            items: [
                {
                    labelKey: "little-elements:login",
                    className: "lw-authmgr__item",
                    href: "#authmgr/login",
                }
            ]
        });
        cx.putDefaultConfig(logoutContext, {
            root: {
                labelKey: "little-elements:logout",
                className: "lw-authmgr",
                href: "#whatever",
            },
            items: [
                {
                    labelKey: "little-elements:logout",
                    className: "lw-authmgr__item",
                    href: "#authmgr/logout",
                },
                {
                    labelKey: "little-elements:userinfo",
                    className: "lw-authmgr__item",
                    href: "#authmgr/userinfo",
                },
            ]
        });
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
