import { html, render, TemplateResult } from "../../../../../lit-html/lit-html.js";

export const css = html`
<style id="lw-headerSimple">
lw-header-simple {
    width: 100%;
}

.lw-header {
    padding:2px;
    width: 100%;
    background-color:#0BDAF7;
    font-family: 'Noto Sans', sans-serif;
    display: flex;
}

.lw-header__nav {
    width: 20%;
    padding: 0px;
}

.lw-header__link {
    color:#777;
}

.lw-header__link:hover {
    color:#777;
    background-color:#0BDAF7;
}

.lw-header__title {
    width: 40%;
    padding: 0px;
    margin: auto;
}

.lw-header__authui {
    width: 40%;
    padding: 0px;
    margin: auto;
}

/* see https://www.smashingmagazine.com/2013/03/tips-and-tricks-for-print-style-sheets/ */
@media print {
    lw-header-simple {
        display: none;
    }
}

</style>
`;
