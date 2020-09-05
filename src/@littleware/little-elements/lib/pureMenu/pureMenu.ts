import {html, render, TemplateResult} from "../../../../../lit-html/lit-html.js";
import styleHelper from "../styleGuide/styleGuide.js";
import {css} from "./pureMenu.css.js";


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

    static build(dropdownParent): PureDropdown {
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
            if (e.keyCode === 27) {
                /* Esc */
                ddm.halt(e);
                ddm.hide();
            }
            // Go to the next link on down arrow
            else if (ARROW_KEYS_ENABLED && e.keyCode === 40) {
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
            else if (ARROW_KEYS_ENABLED && e.keyCode === 38) {
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


/**
 * 
 * @param model for instrumenting the template
 */
function templateFactory(model: LittlePureMenu): TemplateResult {
    return html`
<div class="pure-menu pure-menu-horizontal lw-auth-mgr lw-auth-mgr_login">
    <ul class="pure-menu-list">
        <li class="pure-menu-item pure-menu-has-children pure-menu-allow-hover">
            <a href="#" id="menuLink1" class="pure-menu-link">Sign In</a>
            <ul class="pure-menu-children">
                <li class="pure-menu-item lw-auth-mgr__item lw-auth-mgr__item_logout">
                    <a href="#" class="pure-menu-link">Logout</a>
                </li>
                <li class="pure-menu-item lw-auth-mgr__item lw-auth-mgr__item_login">
                    <a href="#" class="pure-menu-link">Login</a>
                </li>
                <li class="pure-menu-item lw-auth-mgr__item lw-auth-mgr__item_logout">
                    <a href="#" class="pure-menu-link">Account Info</a>
                </li>
            </ul>
        </li>
    </ul>
</div>    
    `;
}


export class LittlePureMenu extends HTMLElement {
    constructor() {
        super();
    }

    public connectedCallback(): void {
        this.render();
    }

    public disconnectedCallback(): void {
        // console.log( "Disconnected!" );
    }
  
    public attributeChangedCallback(attrName?: string, oldVal?: string, newVal?: string): void {
        // console.log( "Attribute change! " + attrName );
        this.render();
    }

    // drop-down manager
    private ddm = null;

    // Render element DOM by returning a `lit-html` template.
    render() {
        if (!this.ddm) {
            render(templateFactory(this), this);
            this.ddm = PureDropdown.build(this);
        }
    }

}

window.customElements.define("lw-pure-menu", LittlePureMenu);

export default LittlePureMenu;

styleHelper.componentCss.push(css);
styleHelper.render();
