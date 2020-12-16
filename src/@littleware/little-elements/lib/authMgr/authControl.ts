import AppContext, { getTools, ToolBox } from "../../common/appContext/appContext.js";
import { SharedState, StateEvent, StateListener } from "../../common/appContext/sharedState.js";
import { Logger, aliasName as loggerAlias } from "../../common/appContext/logging.js";
import { once } from "../../common/mutexHelper.js";
import { stateKey as authStateKey, UserInfo, anonymousUserInfo } from "./authUi.js";
import { stateKey as historyStateKey, HistoryState } from "../appContext/historyHelper.js";


interface ControllerConfig {
    userInfoEndpoint: string;
    loginRedirect: string;
    logoutRedirect: string;
}

interface Tools {
    config: ControllerConfig;
    log: Logger;
    state: SharedState;
}

const configKey = "littleware/lib/authMgr/controller";


export class Controller {
    // initialized below - before web component registered
    tools: Tools = null;

    constructor(tools:Tools) {
        this.tools = tools;
    }

    /**
     * Fetch UserInfo from the config.userInfoEndpoint,
     * return anonymousUserInfo on failure to fetch
     */
    async fetchUserInfo():Promise<UserInfo> {
        const info = await fetch(
                this.tools.config.userInfoEndpoint,
                { mode: "cors", credentials: "include" }
            ).then(
                res => res.json()
            ) as UserInfo;
        if (!info.email) {
            return anonymousUserInfo;
        }
        return info;
    }

    /**
     * Fetch the latest user info, and update the shared state
     * if necessary
     */
    async updateUserInfo():Promise<UserInfo> {
        const result = await this.tools.state.changeState(authStateKey,
                async (oldInfo:UserInfo) => {
                    const newInfo = await this.fetchUserInfo();
                    if (newInfo.email !== oldInfo.email) {
                        return newInfo;
                    }
                    // no state change
                    return null;
                }
        ) as UserInfo;
        return result;
    }

    /**
     * Handle the login/logout statemachine:
     * #authmgr/login, #authmgr/logout, #authmgr/loginresult, #authmgr/userinfo
     * 
     * @param ev 
     */
    navEventHandler: StateListener = (ev:StateEvent) => {
        const hashPath = (ev.data.new as HistoryState).hashPath;
        let redirect = "";  // no redirect by default
        let newUrl = "";
        if (hashPath.endsWith("authmgr/login")) {
            let redirectHash = (ev.data.old as HistoryState).hashPath;
            if (redirectHash.endsWith("/login") || redirectHash.endsWith("/logout")) {
                redirectHash = "";
            }
            newUrl = this.tools.config.loginRedirect;
            redirect = `${location.origin}${location.pathname}?backto=${encodeURIComponent(redirectHash)}#authmgr/loginresult`;
        } else if (hashPath.endsWith("authmgr/logout")) {
            newUrl = this.tools.config.logoutRedirect;
            redirect = `${location.origin}${location.pathname}`;
        }
        if (newUrl && redirect) {
            newUrl += (newUrl.indexOf("?") > 0) ? "&" : "?";
            newUrl += `redirect_uri=${encodeURIComponent(redirect)}`;
            location.replace(newUrl);
            return;
        }
        if (hashPath.endsWith("authmgr/loginresult")) {
            const params = (new URL(location.href)).searchParams;
            const backto = params.get("backto") || "";
            const state = params.get("state");
            params.delete("backto");
            params.delete("state");
            params.delete("backto");
            history.replaceState({}, "", `?${params.toString()}#${backto}`);
            return;
        } else if (hashPath.endsWith("authmgr/userinfo")) { 
            if ((ev.data.old as HistoryState).hashPath) {
                // TODO - implement userinfo endpoint
                this.tools.log.info("authmgr/userinfo not yet implemented");
                history.go(-1);
            } else {
                location.hash = "";
            }
        }
    };

    /**
     * Controller factory enforces singleton
     */
    static startController:() => Promise<Controller> = once(
        async () => new Promise(
            async (resolve, reject) => {
                const cx = await AppContext.get();
                cx.onStart( { log: loggerAlias, state: SharedState.providerName, config: `config/${configKey}` }, 
                    async (toolBox:ToolBox) => {
                        const tools = await getTools(toolBox).then(
                                (tools) => ({
                                    ... tools,
                                    config: { ...tools.config.defaults, ...tools.config.overrides }
                                }) as Tools
                            );
                        const controller = new Controller(tools);
                        controller.updateUserInfo().then(
                            () => {
                                // check in every 5 minutes
                                setInterval(
                                    async () => {
                                        controller.updateUserInfo();
                                    }, 
                                    300000
                                );        
                            }
                        );
                        tools.state.addListener(historyStateKey, controller.navEventHandler)
                        resolve(controller);
                    }
                );
            }
        ) as Promise<Controller>
    );
}


/**
 * Controller web component - launches singleton controller
 * when placed on page.
 */
export class LittleAuthController extends HTMLElement {
    constructor() {
        super();
    }

    public connectedCallback(): void {
        Controller.startController();
    }

    public disconnectedCallback(): void {
        // console.log( "Disconnected!" );
    }    
}

AppContext.get().then(
    (cx) => {
        const apiDomain = "api.frickjack.com";
        cx.putDefaultConfig(configKey, 
            {
                loginRedirect: `https://${apiDomain}/authn/login`,
                logoutRedirect: `https://${apiDomain}/authn/logout`,
                userInfoEndpoint: `https://${apiDomain}/authn/user`
            } as ControllerConfig
            );
    }
);


window.customElements.define("lw-auth-control", LittleAuthController);

export default LittleAuthController;
