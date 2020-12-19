import {html, render, TemplateResult} from "../../../../../lit-html/lit-html.js";
import AppContext, { getTools } from "../../common/appContext/appContext.js";
import { aliasName as loggerAlias, Logger } from "../../common/appContext/logging.js";
import { squish } from "../../common/mutexHelper.js";
import { Ii18n, providerName as i18nProvider } from "../appContext/i18n.js";
import styleHelper from "../styleGuide/styleGuide.js";
import {css} from "./littleDropDown.css.js";

interface Tools {
    i18n: Ii18n;
    log: Logger;
}

let tools: Tools = null; // initialized below

// tslint:disable
const PREFIX = "pure-",
    ACTIVE_CLASS_NAME = PREFIX + "menu-active",
    ARIA_ROLE = "role",
    ARIA_HIDDEN = "aria-hidden",
    MENU_OPEN = 0,
    MENU_CLOSED = 1,
    MENU_ACTIVE_SELECTOR = ".pure-menu-active",
    MENU_LINK_SELECTOR = ".pure-menu-link",
    MENU_SELECTOR = ".pure-menu-children",
    DISMISS_EVENT = (window.hasOwnProperty &&
        window.hasOwnProperty("ontouchstart")) ?
        "touchstart" : "mousedown",

    ARROW_KEYS_ENABLED = true;
// tslint:enable

/**
 * littleDropDown dropdown handler - originally from:
 *     https://purecss.io/js/menus.js
 * TODO - add mechanism to remove listeners when
 * a drop down is removed from the page.
 *
 * Enable drop-down menus in Pure
 * Inspired by YUI3 gallery-simple-menu by Julien LeComte
 * [https://github.com/yui/yui3-gallery/blob/master/src/gallery-simple-menu/js/simple-menu.js]
 */
class PureDropdown {

    public static build(menu: LittleDropDownMenu): PureDropdown {
        const dropdownParent = menu.querySelector(".pure-menu-has-children");
        if (!dropdownParent) { return null; }
        const ddm = new PureDropdown(dropdownParent); // drop down menu

        // Set ARIA attributes
        ddm._link.setAttribute("aria-haspopup", "true");
        ddm._menu.setAttribute(ARIA_ROLE, "menu");
        ddm._menu.setAttribute("aria-labelledby", ddm._link.getAttribute("id"));
        ddm._menu.setAttribute("aria-hidden", "true");
        [].forEach.call(
            ddm._menu.querySelectorAll("li"),
            (el) => {
                el.setAttribute(ARIA_ROLE, "presentation");
            },
        );
        [].forEach.call(
            ddm._menu.querySelectorAll("a"),
            (el) => {
                el.setAttribute(ARIA_ROLE, "menuitem");
            },
        );

        // Toggle on click
        ddm._link.addEventListener("click", (e) => {
            e.stopPropagation();
            tools.log.debug(`lw-drop-down click on ${e.target.href}`);
            e.preventDefault();
            ddm.toggle();
        });

        // Keyboard navigation
        // disable this for now - not relevent on mobile,
        // and prone to memory leak as currently constructed
        if (false) {
            document.addEventListener("keydown", (e) => {
                // tslint:disable
                let currentLink,
                    previousSibling,
                    nextSibling,
                    previousLink,
                    nextLink;
                // tslint:enable

                // if the menu isn't active, ignore
                if (ddm._state !== MENU_OPEN) {
                    return;
                }

                // if the menu is the parent of an open, active submenu, ignore
                if (ddm._menu.querySelector(MENU_ACTIVE_SELECTOR)) {
                    return;
                }

                currentLink = ddm._menu.querySelector(":focus");

                // Dismiss an open menu on ESC
                if (e.key === "Escape") {
                    /* Esc */
                    ddm.halt(e);
                    ddm.hide();
                } else if (ARROW_KEYS_ENABLED && e.key === "ArrowDown") {
                    /* Down arrow */
                    ddm.halt(e);
                    // get the nextSibling (an LI) of the current link's LI
                    nextSibling = (currentLink) ? currentLink.parentNode.nextSibling : null;
                    // if the nextSibling is a text node (not an element), go to the next one
                    while (nextSibling && nextSibling.nodeType !== 1) {
                        nextSibling = nextSibling.nextSibling;
                    }
                    nextLink = (nextSibling) ? nextSibling.querySelector(".pure-menu-link") : null;
                    // if there is no currently focused link, focus the first one
                    if (!currentLink) {
                        ddm._menu.querySelector(".pure-menu-link").focus();
                    } else if (nextLink) {
                        nextLink.focus();
                    }
                } else if (ARROW_KEYS_ENABLED && e.key === "ArrowUp") {
                    /* Up arrow */
                    ddm.halt(e);
                    // get the currently focused link
                    previousSibling = (currentLink) ? currentLink.parentNode.previousSibling : null;
                    while (previousSibling && previousSibling.nodeType !== 1) {
                        previousSibling = previousSibling.previousSibling;
                    }
                    previousLink = (previousSibling) ? previousSibling.querySelector(".pure-menu-link") : null;
                    // if there is no currently focused link, focus the last link
                    if (!currentLink) {
                        ddm._menu.querySelector(".pure-menu-item:last-child .pure-menu-link").focus();
                    } else if (previousLink) {
                        previousLink.focus();
                    }
                }
            });
        }

        // Dismiss an open menu on outside event
        // TODO - Adding a listener at the document level is prone
        // to memory leak if these components are dynamically
        // created and destroyed ....
        document.addEventListener(DISMISS_EVENT, (e) => {
            const target = e.target;
            if (target !== ddm._link && !ddm._menu.contains(target)) {
                ddm.hide();
                ddm._link.blur();
            }
        });

        return ddm;
    }

    // tslint:disable
    private _state = MENU_CLOSED;
    private _dropdownParent;
    private _link;
    private _menu;
    private _firstMenuLink;
    // tslint:enable

    constructor(dropdownParent) {
        this._dropdownParent = dropdownParent;
        this._link = this._dropdownParent.querySelector(MENU_LINK_SELECTOR);
        this._menu = this._dropdownParent.querySelector(MENU_SELECTOR);
        this._firstMenuLink = this._menu.querySelector(MENU_LINK_SELECTOR);
    }

    public show() {
        if (this._state !== MENU_OPEN) {
            this._dropdownParent.classList.add(ACTIVE_CLASS_NAME);
            this._menu.setAttribute(ARIA_HIDDEN, false);
            this._state = MENU_OPEN;
        }
    }

    public hide() {
        if (this._state !== MENU_CLOSED) {
            this._dropdownParent.classList.remove(ACTIVE_CLASS_NAME);
            this._menu.setAttribute(ARIA_HIDDEN, true);
            this._link.focus();
            this._state = MENU_CLOSED;
        }
    }
    public toggle() {
        this[this._state === MENU_CLOSED ? "show" : "hide"]();
    }
    public halt(e) {
        e.stopPropagation();
        e.preventDefault();
    }
}

let idCounter = 0;

/**
 *
 * @param model for instrumenting the template
 */
function templateFactory(model: DropDownModel): TemplateResult {
    return html`
<div class="pure-menu pure-menu-horizontal lw-drop-down ${model.root.className}">
    <ul class="pure-menu-list">
        <li class="pure-menu-item pure-menu-has-children">
            <a href="${model.root.href}" id="ldd${idCounter++}" class="pure-menu-link">${tools.i18n.t(model.root.labelKey)}</a>
            <ul class="pure-menu-children">
                ${model.items.map(
                    (it) => html`<li class="pure-menu-item ${it.className}">
                    <a href="${it.href}" id="ldd${idCounter++}" class="pure-menu-link">${tools.i18n.t(it.labelKey)}</a>
                </li>`)}
            </ul>
        </li>
    </ul>
</div>
    `;
}

export interface MenuItem {
    className: string;
    labelKey: string;
    href: string;
}

export interface DropDownModel {
    root: MenuItem;
    items: MenuItem[];
}

export class LittleDropDownMenu extends HTMLElement {
    // Gets a copy of the default model
    get defaultModel(): DropDownModel {
        return {
            items: [],
            root: {
                className: "lw-drop-down_uninitialized",
                href: "#ignore",
                labelKey: "uninitialized",
            },
        };
    }

    /*
    public attributeChangedCallback(attrName?: string, oldVal?: string, newVal?: string): void {
        // console.log( "Attribute change! " + attrName );
        this.render();
    }
    */

    get contextPath(): string {
        return this.getAttribute("context");
    }

    private modelVal: DropDownModel = null;

    // drop-down manager
    private ddm = null;

    constructor() {
        super();
    }

    public getModel(): Promise<DropDownModel> {
        if (null === this.modelVal) {
            const cxPath = this.contextPath;
            if (cxPath) {
                return AppContext.get().then(
                        (cx) => cx.getConfig(this.contextPath),
                    ).then(
                        (entry) => (
                            {
                                ... this.defaultModel,
                                ... entry.defaults,
                                ... entry.overrides,
                            } as DropDownModel
                        ),
                    ).then(
                        (newModel: DropDownModel) => {
                            if (null === this.modelVal) {
                                this.modelVal = newModel;
                            }
                            return this.modelVal;
                        },
                    );
            } else {
                this.modelVal = this.defaultModel;
            }
        }
        return Promise.resolve(this.modelVal);
    }

    public changeModel(handler: (DropDownModel) => DropDownModel|Promise<DropDownModel>): Promise<void> {
        return this.getModel().then(
            (model) => handler(model),
        ).then(
            (newModel) => {
                if (newModel) {
                    this.modelVal = newModel;
                    this.render();
                }
            },
        );
    }

    public connectedCallback(): void {
        this.render();
    }

    public disconnectedCallback(): void {
        // console.log( "Disconnected!" );
    }

    // Render element DOM by returning a `lit-html` template.
    // Wired to run once only - static configuration.
    private render() {
        return this.getModel().then(
            (model) => {
                render(templateFactory(this.modelVal), this);
                this.ddm = PureDropdown.build(this);
            },
        );
    }
}

//
// Note that the customElement is not defined
// until the tools have been loaded here, so
// we can avoid asynchronously
// loading tools from the code above
//
AppContext.get().then(
    (cx) => {
        cx.onStart(
            { i18n: i18nProvider, log: loggerAlias },
            async (toolBox) => {
                tools = await getTools(toolBox) as Tools;
                window.customElements.define("lw-drop-down", LittleDropDownMenu);
                styleHelper.componentCss.push(css);
                styleHelper.render();
            },
        );
    },
);

export default LittleDropDownMenu;
