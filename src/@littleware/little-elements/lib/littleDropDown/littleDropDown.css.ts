import { html } from '../../../../../lit-html/lit-html.js';

export const css = html`
<style id="lw-drop-down-css">
lw-drop-down {
  display: block;
}

.lw-drop-down__item_hidden {
  display: none;
}

.lw-drop-down__hamburger {
  width: 34px;
  height: 34px;
  display: inline-block;
}

.pure-menu-horizontal .pure-menu-children.lw-drop-down__hamburger-menu {
  right: 0;
  left: -10em;
}

.pure-menu-horizontal .pure-menu-has-children>.pure-menu-link.lw-drop-down__hamburger:after {
  content: '';
}

.lw-drop-down__hamburger:after {
  content: '';
}

.lw-drop-down__hambun {
  background-color: #777;
  display: block;
  width: 20px;
  height: 2px;
  border-radius: 100px;
  position: absolute;
  top: 18px;
  right: 7px;
  transition: all 0.5s;
}

.lw-drop-down__hambun:first-child {
  transform: translateY(-6px);
}

.lw-drop-down__hambun:last-child {
  transform: translateY(-12px);
}

.lw-drop-down__hambun_x {
  transform: rotate(45deg);
}

.lw-drop-down__hambun_x:first-child, .lw-drop-down__hambun_x:last-child {
  transform: rotate(-45deg);
}

</style>
`;
