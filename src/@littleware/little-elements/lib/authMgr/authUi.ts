import { singletonProvider } from '../../common/provider.js';
import AppContext, { getTools } from '../../common/appContext/appContext.js';
import { aliasName as loggerAlias, Logger } from '../../common/appContext/logging.js';
import { SharedState, StateEvent } from '../../common/appContext/sharedState.js';
import { Ii18n, providerName as i18nProvider } from '../appContext/i18n.js';
import LittleDropDown from '../littleDropDown/littleDropDown.js';
import { singleton as styleHelper } from '../styleGuide/styleGuide.js';
import { css } from './authUi.css.js';

export const stateKey = 'little-elements/lib/authMgr/userInfo';

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

export function newUserInfo(
  email: string, groups: string[] = [],
  iat: number = Date.now(),
): UserInfo {
  return { email, groups, iat };
}

export const anonymousUserInfo: UserInfo = Object.freeze(
  {
    email: 'anonymous',
    groups: [],
    iat: 0,
  },
);

export const loginContext = 'littleware/lib/authMgr/login';
export const logoutContext = 'littleware/lib/authMgr/logout';
export const providerName = 'driver/littleware/little-elements/lw-auth-ui';

// initialized below - before web component registered
let tools: Tools = null;

export class LittleAuthUI extends HTMLElement {
  private userVal = 'anonymous';

  private loginMenu: LittleDropDown;

  private logoutMenu: LittleDropDown;

  constructor() {
    super();
    this.loginMenu = new LittleDropDown();
    this.loginMenu.setAttribute('context', loginContext);
    this.logoutMenu = new LittleDropDown();
    this.logoutMenu.setAttribute('context', logoutContext);
  }

  get user() { return this.userVal; }

  set user(value: string) {
    if (this.userVal !== value) {
      this.userVal = value;
      this.logoutMenu.changeModel(
        (model) => {
          model.root.labelKey = (this.userVal || '...').replace(/@.+$/, '@...');
          return model;
        },
      ).then(
        () => this.render(),
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
  public listener = (ev: StateEvent) => {
    this.user = (ev.data.new as UserInfo).email;
  };

  public connectedCallback(): void {
    this.render();
    tools.state.addListener(
      stateKey,
      this.listener,
    );
  }

  public disconnectedCallback(): void {
    tools.state.removeListener(stateKey, this.listener);
  }

  // Render element DOM by returning a `lit-html` template.
  public render() {
    if (this.user && this.user !== 'anonymous') {
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
      items: [
        {
          className: 'lw-authmgr__item',
          href: '#authmgr/login',
          labelKey: 'little-elements:login',
        },
      ],
      root: {
        className: 'lw-authmgr',
        href: '#whatever',
        labelKey: 'little-elements:anonymous',
      },
    });
    cx.putDefaultConfig(logoutContext, {
      items: [
        {
          className: 'lw-authmgr__item',
          href: '#authmgr/logout',
          labelKey: 'little-elements:logout',
        },
        /* TODO: enable this ...
                {
                    className: "lw-authmgr__item",
                    href: "#authmgr/userinfo",
                    labelKey: "little-elements:userinfo",
                },
                */
      ],
      root: {
        className: 'lw-authmgr',
        href: '#whatever',
        labelKey: 'little-elements:logout',
      },
    });
    cx.putProvider(
      providerName,
      { i18n: i18nProvider, log: loggerAlias, state: SharedState.providerName },
      async (toolBox) => {
        tools = await getTools(toolBox) as Tools;
        window.customElements.define('lw-auth-ui', LittleAuthUI);
        styleHelper.componentCss.push(css);
        styleHelper.render();
        return singletonProvider(() => 'lw-auth-ui');
      },
    );
    // force instantiation - otherwise default is lazy
    cx.onStart({ 'lw-auth-ui': providerName }, () => {});
  },
);

export default LittleAuthUI;
