import {html, render, TemplateResult} from "../../../../../lit-html/lit-html.js";
import {css, links, meta} from "./styleGuide.css.js";

// TODO - service worker - import workbox
let container = null;
/**
 * Little CSS management helper dynamically adds
 * given render blocks (intended to be <style> blocks
 * form client components and applications) to the
 * head of a document.
 * Ex:
 *    ```
 * helper.componentCss.push( html`<style>...</style>` ); helper.render();
 *    ```
 * The helper renders the baseCss template results, then the componentCss,
 * and finally the appCss; so the idea is that:
 * - baseCss defines the base rules from the style guide
 * - componentCss defines extensions for styling each component
 * - appCss cascades application specific overrides and layout rules
 *
 * Note: StyleGuide.css.js includes an optional block of `<meta>` tags
 * that may be added to `helper.baseCss` if the html shell does
 * not already define the viewport and content-type.
 */
export class StyleHelper {
    public baseCss: TemplateResult[] = [];
    public componentCss: TemplateResult[] = [];
    public appCss: TemplateResult[] = [];

    public render() {
        if ( container === null ) {
            container = document.createElement("DIV");
            container.setAttribute("id", "lw-style-guide");
            document.head.appendChild(container);
        }
        render(template(this), container);
    }
}

const template = (info: StyleHelper) => html`

${
    info.baseCss
}
${
    info.componentCss
}
${
    info.appCss
}
`;

export const singleton = new StyleHelper();
export default singleton;

// do not include 'meta' - shell usually handles that
[links, css].forEach(
    (block) => { singleton.baseCss.push(block); },
);

singleton.render();
