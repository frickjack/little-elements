import { singletonProvider } from '../../common/provider.js';
import AppContext, { getTools } from '../../common/appContext/appContext.js';
import { deepCopy } from '../../common/mutexHelper.js';
import { aliasName as loggerAlias, Logger } from '../../common/appContext/logging.js';
import { singleton as styleHelper } from '../styleGuide/styleGuide.js';
import '../authMgr/authControl.js';
import { providerName as authUiProvider } from '../authMgr/authUi.js';
import { providerName as dropDownProvider, DropDownModel } from '../littleDropDown/littleDropDown.js';
import { html, render } from '../../../../../lit-html/lit-html.js';
import './googleAnalytics.js';
import { css } from './headerSimple.css.js';

export const contextConfigPath = 'littleware/lib/lw-header-simple';
export const providerName = 'driver/littleware/little-elements/lw-header-simple';

interface Tools {
  log: Logger;
}

// eslint-disable-next-line
let tools: Tools = null; // initialized below

export interface HeaderModel {
  hamburger: DropDownModel;
  logo: {
    text: string,
    iconUrl: string,
  },
}

const defaultModel: HeaderModel = deepCopy({
  hamburger: {
    items: [
      {
        className: 'lw-header-simple__hamburger-item',
        href: '/littleware/index.html',
        labelKey: 'Littleware',
      },
      {
        className: 'lw-header-simple__hamburger-item',
        href: '/connect/index.html',
        labelKey: 'Connect',
      },
      {
        className: 'lw-header-simple__hamburger-item',
        href: '/apps/index.html',
        labelKey: 'Apps',
      },
    ],
    root: {
      className: 'lw-header-simple__hamburger',
      href: '#hamburger',
      labelKey: 'little-hamburger',
    },
  },
  logo: {
    text: 'Logo',
    iconUrl: '',
  },
}, true);

function templateFactory(header: SimpleHeader) {
  const titleStr = (header.getAttribute('title') || 'Home').replace(/[<>\r\n]+/g, '');
  return html`
  <div class="lw-nav-block lw-nav-block_gradient lw-header">
      <div class="lw-header__logo">
                <a href="/" class="pure-menu-link"><i class="fas fa-home"></i>  ${header.model.logo.text}</a>
      </div>
      <div class="lw-header__title">
                ${titleStr}
      </div>
      <div class="lw-header__authui">
        <lw-auth-ui></lw-auth-ui>
        <lw-auth-control></lw-auth-control>      
      </div>
      <div class="lw-header__hamburger">
          <lw-drop-down .model=${header.model.hamburger}></lw-drop-down>
      </div>
    </div>
  `;
}

/**
 * SimpleHeader custom element - just has a nav "home" button, and a title
 */
export class SimpleHeader extends HTMLElement {
  private modelVal;

  get model() {
    if (this.modelVal == null) {
      this.modelVal = defaultModel;
    }
    return this.modelVal;
  }

  /**
     * Helper initializes the  model property from the
     * context path if not already set
     *
     * @returns
     */
  public fetchModel(): Promise<DropDownModel> {
    if (!this.modelVal) {
      return AppContext.get().then(
        (cx) => cx.getConfig(contextConfigPath),
      ).then(
        (entry) => (
          {
            ...defaultModel,
            ...entry.defaults,
            ...entry.overrides,
          } as HeaderModel
        ),
      ).then(
        (newModel: HeaderModel) => {
          if (!this.modelVal) {
            this.modelVal = newModel;
          }
          return this.model;
        },
      );
    }
    return Promise.resolve(this.model);
  }


  /**
   *  Monitor the 'name' attribute for changes, see:
   *     https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
   */
  static get observedAttributes(): string[] { return ['title']; }

  public attributeChangedCallback(): void {
    // console.log( "Attribute change! " + attrName );
    this._render();
  }

  /**
   * Rebuild the path elements under the arrpie-pielist group
   * Note: only public to fascilitate testing
   */
  public _render(): void {
    this.fetchModel().then(
      () => render(templateFactory(this), this),
    );
  }
}

AppContext.get().then(
  (cx) => {
    cx.putDefaultConfig(contextConfigPath, defaultModel);
    cx.putProvider(
      providerName,
      {
        log: loggerAlias,
        'lw-drop-down': dropDownProvider,
        'lw-auth-ui': authUiProvider,
      },
      async (toolBox) => {
        // eslint-disable-next-line
        tools = await getTools(toolBox) as Tools;
        window.customElements.define('lw-header-simple', SimpleHeader);
        styleHelper.componentCss.push(css);
        styleHelper.render();
        return singletonProvider(() => 'lw-header-simple');
      },
    );
    // force instantiation - otherwise default is lazy
    cx.onStart({ 'lw-header-simple': providerName }, () => {});
  },
);
