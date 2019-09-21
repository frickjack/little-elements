import {singleton as styleHelper} from '../styleGuide.js';
import {sleep} from '../../../common/mutexHelper.js';

describe('the styleGuide singleton', function() {
    it('sets up a container for little-element styles in the header', function(done) {
        // Give browser chance to render
        sleep(20).then(function() {
            expect(!! document.head.querySelector('div#lw-style-guide')).toBe(true);
            done();
        });
    });
    it('adds the base and component styles to the page', function(done) {
        // Give browser chance to render
        sleep(20).then(
            function() {
                let numNodes = document.head.querySelector('div#lw-style-guide').children.length;
                expect(numNodes).toBeGreaterThanOrEqual(styleHelper.baseCss.length + styleHelper.componentCss.length + styleHelper.appCss.length);
                done();
            }
        );
    });
});
