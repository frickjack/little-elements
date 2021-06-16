import {singleton as styleHelper} from "../../../../../@littleware/little-elements/web/lib/styleGuide/styleGuide.js";
import "../../../../../@littleware/little-elements/web/lib/authMgr/authControl.js";
import "../../../../../@littleware/little-elements/web/lib/authMgr/authUi.js";
import { html, render } from "../../../../../lit-html/lit-html.js";
import "./googleAnalytics.js";
import { css } from "./headerSimple.css.js";

function templateFactory(header: SimpleHeader) {
  const titleStr = (header.getAttribute("title") || "Home").replace( /[<>\r\n]+/g, "" );
  return html`
  <div class="lw-header">
      <div class="lw-header__nav">
                <a href="/" class="pure-menu-link lw-header__link"><i class="fa fa-home fa-2x"></i></a>
      </div>
      <div class="lw-header__title">
                ${titleStr}
      </div>
      <div class="lw-header__authui">
          <lw-auth-ui></lw-auth-ui>
          <lw-auth-control></lw-auth-control>
      </div>
    </div>
  `;
}

/**
 * SimpleHeader custom element - just has a nav "home" button, and a title
 */
export class SimpleHeader extends HTMLElement {
    // Can define constructor arguments if you wish.
    constructor() {
      // If you define a ctor, always call super() first!
      // This is specific to CE and required by the spec.
      super();
    }

    /**
     *  Monitor the 'name' attribute for changes, see:
     *     https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
     */
    static get observedAttributes(): string[] { return ["title"]; }

    public attributeChangedCallback(attrName?: string, oldVal?: string, newVal?: string): void {
      // console.log( "Attribute change! " + attrName );
      this._render();
    }

    /**
     * Rebuild the path elements under the arrpie-pielist group
     * Note: only public to fascilitate testing
     */
    public _render(): void {
      render( templateFactory(this), this );
    }
}

window.customElements.define( "lw-header-simple", SimpleHeader );
styleHelper.componentCss.push(css);
styleHelper.render();
