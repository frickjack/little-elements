import { sleep } from '../../../common/mutexHelper.js';
import { singleton as styleHelper } from '../styleGuide.js';

describe('the styleGuide singleton', () => {
  it('sets up a container for little-element styles in the header', (done) => {
    // Give browser chance to render
    sleep(20).then(() => {
      expect(!!document.head.querySelector('div#lw-style-guide')).toBe(true);
      done();
    });
  });
  it('adds the base and component styles to the page', (done) => {
    // Give browser chance to render
    sleep(20).then(
      () => {
        const numNodes = document.head.querySelector('div#lw-style-guide').children.length;
        expect(numNodes).toBeGreaterThanOrEqual(
          // eslint-disable-next-line
          styleHelper.baseCss.length + styleHelper.componentCss.length + styleHelper.appCss.length,
        );
        done();
      },
    );
  });
});
