import {singleton as styleHelper} from '../styleGuide.js';

describe('the styleGuide singleton', function() {
    it('sets up a container for little-element styles in the header', function() {
        expect(!! document.head.querySelector('div#lw-style-guide')).toBe(true);
    });
    it('adds the base and component styles to the page', function() {
        let numNodes = document.head.querySelector('div#lw-style-guide').children.length;
        expect(numNodes).toBeGreaterThanOrEqual(styleHelper.baseCss.length + styleHelper.componentCss.length + styleHelper.appCss.length);
    });
});
