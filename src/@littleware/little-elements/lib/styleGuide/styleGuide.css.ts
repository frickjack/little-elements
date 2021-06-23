import { html } from '../../../../../lit-html/lit-html.js';

export const links = html`
<link href="/modules/purecss/build/pure-min.css" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css?family=Noto+Sans|Oswald" crossorigin="anonymous" rel="stylesheet" />
<link href="/modules/@fortawesome/fontawesome-free/css/all.min.css" rel="stylesheet" />
`;

/**
 * see https://www.smashingmagazine.com/2014/07/bem-methodology-for-small-projects/ 
 * see Notes/explanation/littleUX.md
 * 
 * TODO: add rules for <code>/<pre> blocks, mono font
 */
export const css = html`
<style id="styleGuide_css">

* {
    box-sizing: border-box;
}

:root {
    --lw-primary-text-color: #222222;
    --lw-secondary-text-color: #777;
    --lw-primary-bg-color: #fefefe;
    --lw-whitespace-bg-color: #f2f2f4;
    --lw-secondary-bg-color: #fafafa;
    --lw-header-background-color: var(--lw-primary-bg-color);
    --lw-primary-font-family: 'Oswald script=all rev=4', Verdana, sans-serif;
    --lw-secondary-font-family: 'Noto Sans', sans-serif;
    --lw-section-border-color: black;
    --lw-nav-border-color: #0BDAF7;
    --lw-nav-bg-gradient: linear-gradient(var(--lw-header-background-color), #f0fdff);
    --lw-sec1-border-color: #bb38b7;
    --lw-sec1-bg-gradient: linear-gradient(var(--lw-primary-bg-color), #fad7f6);
    --lw-sec2-border-color: #0bf749;
    --lw-sec2-bg-gradient: linear-gradient(var(--lw-primary-bg-color), #f1fff1);
}

body {
    font-family: var(--lw-primary-font-family);
    color: var(--lw-primary-text-color);
    background-color: var(--lw-whitespace-bg-color);
    width: 100%;
    min-width: 320px;
    height: 100%;
    min-height: 320px;
}

h1,h2,h3,h4 {
    color: var(--lw-secondary-text-color);
    font-weight: normal;
    font-family: var(--lw-secondary-font-family);
    margin-top: 10px;
    margin-bottom: 10px;
}

header {
    font-family: var(--lw-secondary-font-family);
    background-color: var(--lw-secondary-bg-color);
    color: var(--lw-secondary-text-color);
}

footer {
    font-family: var(--lw-secondary-font-family);
    background-color: var(--lw-secondary-bg-color);
    color: var(--lw-secondary-text-color);
}

section {
    font-family: var(--lw-primary-font-family);
    background-color: var(--lw-primary-bg-color);
    color: var(--lw-primary-text-color);
    padding: 10px 5px;
}

.pure-g [class*=pure-u] {
    font-family: 'Oswald script=all rev=4', Verdana, sans-serif;
    font-weight: 300;
}


.pure-menu-link {
    font-family: var(--lw-secondary-font-family);
}

.pure-menu-list_wrap {
    white-space:normal;
}

/*------ 
 * Document sections
 * Each document/site has:
 *    - content
 *    - content metadata (nav affordance, headings, etc)
 *    - white space
 *    - action tools
 */
.lw-nav-block {
    font-family: var(--lw-secondary-font-family);
    border-bottom: thin solid var(--lw-nav-border-color);
    background-color: var(--lw-secondary-bg-color);
}

.lw-nav-block_gradient {
    background: var(--lw-nav-bg-gradient);
    background-color: var(--lw-secondary-bg-color);
}

.lw-section-block1 {
    font-family: var(--lw-primary-font-family);
    --lw-section-border-color: var(--lw-sec1-border-color);
    border-bottom: thin solid var(--lw-section-border-color);
    min-height: 100px;
    background-color: var(--lw-primary-bg-color);
}

.lw-section-block1_gradient {
    background: var(--lw-sec1-bg-gradient);
    background-color: var(--lw-primary-bg-color);
}

/*--- rules for tiles ---- */

.lw-tile-container {
    display: flex;
    flex-wrap: wrap;
    background-color: var(--lw-whitespace-bg-color);
}

.lw-tile {
    width: 300px;
    height: 250px;
    padding: 10px;
    margin: 10px;
    border-radius: 5px;
    border: solid thin var(--lw-section-border-color);
    overflow: hidden;
    background-color: var(--lw-primary-bg-color);
}

/*------ Rules for styleGuide/index.html showcase ---------*/

.lw-icon__57x57 {
    width: 57px;
    height: 57px;
}

.lw-colorswatch {
    width: 100px;
    height: 300px;
    padding: 10px;
    background-color:white;
}

.lw-colorswatch__box_fill_lwblue {
    fill: #0BDAF7
}

.lw-colorswatch__box_fill_lwgreen {
    fill: #474;
}

.lw-colorswatch__box_fill_lwwhite {
    fill: #eeeeee;
}

.lw-colorswatch__box_fill_lwblack {
    fill: #222222;
}

.lw-colorswatch__box_fill_lwgray {
    fill: #777;
}

/*------------------------------------
 * Simple CSS Modal:
 *    https://www.webdesignerdepot.com/2012/10/creating-a-modal-window-with-html5-and-css3/
 */
 .lw-modalDialog {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.8);
    z-index: 99999;
    opacity:0;
    transition: opacity 400ms ease-in;
    pointer-events: none;
}

.lw-modalDialog:target, .lw-modalDialog_open {
    opacity:1;
    pointer-events: auto;
}

.lw-modalDialog__content {
    width: 330px;
    position: relative;
    margin: 10% auto;
    padding: 5px 20px 13px 20px;
    border-radius: 10px;
    background: #fff;
    background: -moz-linear-gradient(#fff, #999);
    background: -webkit-linear-gradient(#fff, #999);
    background: -o-linear-gradient(#fff, #999);
}

.lw-modalDialog__closeX {
    background: #606061;
    color: #FFFFFF;
    line-height: 25px;
    position: absolute;
    right: -12px;
    text-align: center;
    top: -10px;
    width: 24px;
    text-decoration: none;
    font-weight: bold;
    border-radius: 12px;
    box-shadow: 1px 1px 3px #000;
}

.lw-modalDialog__closeX:hover { background: #00d9ff; }

.lw-smiley {
    color:green; font-weight:bold; font-size:large;
}

.lw-content-root {
    width: 100%;
    min-width: 320px;
    height: 100%;
    min-height: 320px;
    padding: 10px;
}

.lw-section {
    width: 100%;
}

.lw_hidden {
    display: none;
}

/* see https://www.smashingmagazine.com/2013/03/tips-and-tricks-for-print-style-sheets/ */
@media print {
    lw-header-simple {
        display: none;
    }

    body {
        color: #000;
        background: #fff;
    }

    .lw-content-root {
        padding: 0px;
    }

    @page {
        margin: 2cm;
    }

    h2, h3 {
        page-break-after: avoid;
    }

    img {
        max-width: 100% !important;
    }

    ul, img {
        page-break-inside: avoid;
    }
}

</style>
`;
