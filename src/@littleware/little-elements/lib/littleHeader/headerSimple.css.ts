import { html } from '../../../../../lit-html/lit-html.js';

export const css = html`
<style id="lw-headerSimple">
lw-header-simple {
    width: 100%;
}

.lw-header {
    padding: 2px;
    width: 100%;
    font-family: var(--lw-secondary-font-family);
    display: flex;
    color: var(--lw-secondary-text-color);
    margin-bottom: 10px;
    border-width: thick;
}

.lw-header__logo {
    width: 40%;
    padding: 0px;
    color:var(--lw-secondary-text-color);
    margin: auto;
}

.lw-header__logo:hover {
    color:var(--lw-secondary-text-color);
    background-color:var(--lw-header-background-color);
}

.lw-header__title {
    width: 20%;
    padding: 0px;
    margin: auto;
    overflow: hidden;
    visibility: hidden;
}

.lw-header__authui {
    width: 40%;
    padding: 0px;
    margin: auto;
}

.lw-header__hamburger {
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
