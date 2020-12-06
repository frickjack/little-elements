import AppContext, { getTools, ToolBox } from "../../common/appContext/appContext.js";
import { SharedState } from "../../common/appContext/sharedState.js";
import { Logger, aliasName as loggerAlias } from "../../common/appContext/logging.js";
import { once } from "../../common/mutexHelper.js";
import { stateKey, UserInfo, anonymousUserInfo } from "./authUi.js";


interface ControllerConfig {
    userInfoEndpoint: string;
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
        const info = await fetch(this.tools.config.userInfoEndpoint).then(
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
        const result = await this.tools.state.changeState(stateKey,
                async (oldInfo:UserInfo) => {
                    const newInfo = await this.fetchUserInfo();
                    if (newInfo.email !== oldInfo.email) {
                        return newInfo;
                    }
                    return null;
                }
        ) as UserInfo;
        return result;
    }


    /**
     * Controller factory enforces singleton
     */
    static startController:() => Promise<Controller> = once(
        async () => new Promise(
            async (resolve, reject) => {
                const cx = await AppContext.get();
                cx.onStart( { log: loggerAlias, state: SharedState.providerName, config: `config:${configKey}` }, 
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
        cx.putDefaultConfig(configKey, {
            userInfoEndpoint: "https://api.frickjack.com/authn/user"
        });
    }
);


window.customElements.define("lw-auth-control", LittleAuthController);

export default LittleAuthController;
