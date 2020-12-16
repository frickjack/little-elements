import { singleton as styleHelper } from "../styleGuide/styleGuide.js";
import AppContext, { getTools } from "../../common/appContext/appContext.js";
import { Ii18n, providerName as i18nProvider } from "../appContext/i18n.js";
import LittleDropDown from "../littleDropDown/littleDropDown.js";
import { Logger, aliasName as loggerAlias } from "../../common/appContext/logging.js";
import { SharedState, StateEvent } from "../../common/appContext/sharedState.js";
import { css } from "./authUi.css.js";

export const stateKey = "little-elements/lib/authMgr/userInfo";

interface Tools {
    i18n: Ii18n;
    log: Logger;
    state: SharedState;
}

export interface UserInfo {
    email: string;
    groups: string[];
    iat: number;
}

export function newUserInfo(email: string, groups: string[] = [], iat: number = Date.now()): UserInfo {
    return { email, groups, iat };
}

export const anonymousUserInfo:UserInfo = Object.freeze(
    {
        email: "anonymous",
        groups: [],
        iat: 0
    }
);

const loginContext = "littleware/lib/authMgr/login";
const logoutContext = "littleware/lib/authMgr/logout";


// initialized below - before web component registered
let tools: Tools = null; 


export class LittleAuthUI extends HTMLElement {
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
        if (this.userVal !== value) {
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
    }

    /**
     * Can set to NOOP if you do not want the element
     * to udpate on shared state change - for testing
     * or whatever.
     * 
     * @param ev 
     */
    public listener = (ev:StateEvent) => {
        this.user = (ev.data.new as UserInfo).email;
    };

    public connectedCallback(): void {
        this.render();
        tools.state.addListener(
            stateKey,
            this.listener
        );
    }

    public disconnectedCallback(): void {
        tools.state.removeListener(stateKey, this.listener);
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
            { i18n: i18nProvider, log: loggerAlias, state: SharedState.providerName },
            async (toolBox) => {
                tools = await getTools(toolBox) as Tools;
                window.customElements.define("lw-auth-ui", LittleAuthUI);
                styleHelper.componentCss.push(css);
                styleHelper.render();
            }
        );
    }
);


export default LittleAuthUI;
