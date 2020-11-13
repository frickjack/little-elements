import {html, render, TemplateResult} from "../../../../../lit-html/lit-html.js";
import AppContext, { getTools } from '../../common/appContext/appContext.js';
import { once } from '../../common/mutexHelper.js';
import { Ii18n, providerName as i18nProvider } from '../appContext/i18n.js';
import { Logger, aliasName as loggerAlias } from '../../common/appContext/logging.js';
import styleHelper from "../styleGuide/styleGuide.js";
import {css} from "./pureMenu.css.js";


interface Tools {
    i18n: Ii18n;
    log: Logger;
}

let tools: Tools = null; // initialized below

const PREFIX = 'pure-',
    ACTIVE_CLASS_NAME = PREFIX + 'menu-active',
    ARIA_ROLE = 'role',
    ARIA_HIDDEN = 'aria-hidden',
    MENU_OPEN = 0,
    MENU_CLOSED = 1,
    MENU_ACTIVE_SELECTOR = '.pure-menu-active',
    MENU_LINK_SELECTOR = '.pure-menu-link',
    MENU_SELECTOR = '.pure-menu-children',
    DISMISS_EVENT = (window.hasOwnProperty &&
        window.hasOwnProperty('ontouchstart')) ?
        'touchstart' : 'mousedown',

    ARROW_KEYS_ENABLED = true;

/**
 * Puremenu dropdown handler - originally from:
 *     https://purecss.io/js/menus.js
 *
 * Enable drop-down menus in Pure
 * Inspired by YUI3 gallery-simple-menu by Julien LeComte
 * [https://github.com/yui/yui3-gallery/blob/master/src/gallery-simple-menu/js/simple-menu.js]
 */
class PureDropdown {
    private _state = MENU_CLOSED;
    private _dropdownParent;
    private _link;
    private _menu;
    private _firstMenuLink;

    constructor(dropdownParent) {
        this._dropdownParent = dropdownParent;
        this._link = this._dropdownParent.querySelector(MENU_LINK_SELECTOR);
        this._menu = this._dropdownParent.querySelector(MENU_SELECTOR);
        this._firstMenuLink = this._menu.querySelector(MENU_LINK_SELECTOR);
    }

    static build(menu:LittleDropDownMenu): PureDropdown {
        const dropdownParent = menu.querySelector('.pure-menu-has-children');
        if (!dropdownParent) { return null; }
        const ddm = new PureDropdown(dropdownParent); // drop down menu
        
        // Set ARIA attributes
        ddm._link.setAttribute('aria-haspopup', 'true');
        ddm._menu.setAttribute(ARIA_ROLE, 'menu');
        ddm._menu.setAttribute('aria-labelledby', ddm._link.getAttribute('id'));
        ddm._menu.setAttribute('aria-hidden', 'true');
        [].forEach.call(
            ddm._menu.querySelectorAll('li'),
            function(el){
                el.setAttribute(ARIA_ROLE, 'presentation');
            }
        );
        [].forEach.call(
            ddm._menu.querySelectorAll('a'),
            function(el){
                el.setAttribute(ARIA_ROLE, 'menuitem');
            }
        );

        // Toggle on click
        ddm._link.addEventListener('click', function (e) {
            e.stopPropagation();
            tools.log.debug(`lw-drop-down click on ${e.target.href}`);
            e.preventDefault();
            ddm.toggle();
        });

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            var currentLink,
                previousSibling,
                nextSibling,
                previousLink,
                nextLink;

            // if the menu isn't active, ignore
            if (ddm._state !== MENU_OPEN) {
                return;
            }

            // if the menu is the parent of an open, active submenu, ignore
            if (ddm._menu.querySelector(MENU_ACTIVE_SELECTOR)) {
                return;
            }

            currentLink = ddm._menu.querySelector(':focus');

            // Dismiss an open menu on ESC
            if (e.key === "Escape") {
                /* Esc */
                ddm.halt(e);
                ddm.hide();
            }
            // Go to the next link on down arrow
            else if (ARROW_KEYS_ENABLED && e.key === 'ArrowDown') {
                /* Down arrow */
                ddm.halt(e);
                // get the nextSibling (an LI) of the current link's LI
                nextSibling = (currentLink) ? currentLink.parentNode.nextSibling : null;
                // if the nextSibling is a text node (not an element), go to the next one
                while (nextSibling && nextSibling.nodeType !== 1) {
                    nextSibling = nextSibling.nextSibling;
                }
                nextLink = (nextSibling) ? nextSibling.querySelector('.pure-menu-link') : null;
                // if there is no currently focused link, focus the first one
                if (!currentLink) {
                    ddm._menu.querySelector('.pure-menu-link').focus();
                }
                else if (nextLink) {
                    nextLink.focus();
                }
            }
            // Go to the previous link on up arrow
            else if (ARROW_KEYS_ENABLED && e.key === 'ArrowUp') {
                /* Up arrow */
                ddm.halt(e);
                // get the currently focused link
                previousSibling = (currentLink) ? currentLink.parentNode.previousSibling : null;
                while (previousSibling && previousSibling.nodeType !== 1) {
                    previousSibling = previousSibling.previousSibling;
                }
                previousLink = (previousSibling) ? previousSibling.querySelector('.pure-menu-link') : null;
                // if there is no currently focused link, focus the last link
                if (!currentLink) {
                    ddm._menu.querySelector('.pure-menu-item:last-child .pure-menu-link').focus();
                }
                // else if there is a previous item, go to the previous item
                else if (previousLink) {
                    previousLink.focus();
                }
            }
        });

        // Dismiss an open menu on outside event
        document.addEventListener(DISMISS_EVENT, function (e) {
            var target = e.target;
            if (target !== ddm._link && !ddm._menu.contains(target)) {
                ddm.hide();
                ddm._link.blur();
            }
        });

        return ddm;
    }

    
    show() {
        if (this._state !== MENU_OPEN) {
            this._dropdownParent.classList.add(ACTIVE_CLASS_NAME);
            this._menu.setAttribute(ARIA_HIDDEN, false);
            this._state = MENU_OPEN;
        }
    }

    hide() {
        if (this._state !== MENU_CLOSED) {
            this._dropdownParent.classList.remove(ACTIVE_CLASS_NAME);
            this._menu.setAttribute(ARIA_HIDDEN, true);
            this._link.focus();
            this._state = MENU_CLOSED;
        }
    };

    toggle () {
        this[this._state === MENU_CLOSED ? 'show' : 'hide']();
    };

    halt (e) {
        e.stopPropagation();
        e.preventDefault();
    };

}


let idCounter=0;

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
                    it => html`<li class="pure-menu-item ${it.className}">
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
    private _model:DropDownModel = {
        root: {
            labelKey: "uninitialized",
            className: "lw-drop-down_uninitialized",
            href: "#ignore"
        },
        items: []
    }

    constructor() {
        super();
    }

    get model(): DropDownModel { return this._model; }

    public connectedCallback(): void {
        this.render();
    }

    public disconnectedCallback(): void {
        // console.log( "Disconnected!" );
    }
  
    /*
    public attributeChangedCallback(attrName?: string, oldVal?: string, newVal?: string): void {
        // console.log( "Attribute change! " + attrName );
        this.render();
    }
    */

    get contextPath(): string {
        return this.getAttribute('context');
    }

    // drop-down manager
    private ddm = null;

    // Render element DOM by returning a `lit-html` template.
    // Wired to run once only - static configuration.
    private render = once(async () => {
        const cxPath = this.contextPath;
        if (cxPath) {
            this._model = await AppContext.get().then(
                    cx => cx.getConfig(this.contextPath)
                ).then(
                    entry => ({ ... this.model, ... entry.defaults, ... entry.overrides } as DropDownModel)
                )
        }
        render(templateFactory(this.model), this);
        this.ddm = PureDropdown.build(this);
    });
}

AppContext.get().then(
    (cx) => {
        cx.onStart(
            { i18n: i18nProvider, log: loggerAlias },
            async (toolBox) => {
                tools = await getTools(toolBox) as Tools;
                window.customElements.define("lw-drop-down", LittleDropDownMenu);
                styleHelper.componentCss.push(css);
                styleHelper.render();
            }
        );
    }
);

export default LittleDropDownMenu;
