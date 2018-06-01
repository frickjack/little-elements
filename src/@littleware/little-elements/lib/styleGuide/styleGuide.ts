import {html, render, TemplateResult} from '../../../../lit-html/lit-html.js';
import {meta, links, css} from './styleGuide.css.js';

// TODO - service worker - import workbox
const container = document.createElement('DIV');
container.setAttribute('id', 'lw-style-guide');
document.head.appendChild(container);

export class StyleHelper {
    baseCss:Array<TemplateResult> = [];
    componentCss:Array<TemplateResult> = [];
    appCss:Array<TemplateResult> = [];

    constructor() {
    }

    render() {
        render(template(this), container);
    }
}

const template = (info:StyleHelper) => html`

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
[meta, links, css].forEach(
    block => { singleton.baseCss.push(block); }
);

singleton.render();
