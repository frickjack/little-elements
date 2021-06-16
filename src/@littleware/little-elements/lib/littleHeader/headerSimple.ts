import AppContext, { getTools } from "../../common/appContext/appContext.js";
import {singleton as styleHelper} from "../styleGuide/styleGuide.js";
import "../authMgr/authControl.js";
import "../authMgr/authUi.js";
import "../littleDropDown/littleDropDown.js";
import { html, render } from "../../../../../lit-html/lit-html.js";
import "./googleAnalytics.js";
import { css } from "./headerSimple.css.js";

export const contextConfigPath = "littleware/lib/littleHeader";

function templateFactory(header: SimpleHeader) {
  const titleStr = (header.getAttribute("title") || "Home").replace( /[<>\r\n]+/g, "" );
  return html`
  <div class="lw-nav-block lw-nav-block_gradient lw-header">
      <div class="lw-header__logo">
                <a href="/" class="pure-menu-link"><i class="fa fa-home fa-2x"></i>Logo</a>
      </div>
      <div class="lw-header__title">
                ${titleStr}
      </div>
      <div class="lw-header__authui">
          <lw-auth-ui></lw-auth-ui>
          <lw-auth-control></lw-auth-control>
      </div>
      <div class="lw-header__hamburger">
          <lw-drop-down context="${contextConfigPath}/hamburger"></lw-drop-down>
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

AppContext.get().then(
  (cx) => {
      cx.putDefaultConfig(`${contextConfigPath}/hamburger`, {
          items: [
              {
                  className: "lw-header-simple__hamburger-item",
                  href: "/littleware/index.html",
                  labelKey: "Littleware",
              },
              {
                className: "lw-header-simple__hamburger-item",
                href: "/connect/index.html",
                labelKey: "Connect",
              },
              {
                className: "lw-header-simple__hamburger-item",
                href: "/connect/index.html",
                labelKey: "Connect",
              },
              {
                className: "lw-header-simple__hamburger-item",
                href: "/apps/index.html",
                labelKey: "Apps",
              },
          ],
          root: {
              className: "lw-header-simple__hamburger",
              href: "#hamburger",
              labelKey: "little-hamburger",
          },
      });
      cx.onStart(
          {},
          async (toolBox) => {
            window.customElements.define( "lw-header-simple", SimpleHeader );
            styleHelper.componentCss.push(css);
            styleHelper.render();
          },
      );
  },
);
