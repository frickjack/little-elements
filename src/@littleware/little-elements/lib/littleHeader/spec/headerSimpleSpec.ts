import { AppContext } from '../../appContext/appContext.js';
import { sleep } from '../../../common/mutexHelper.js';
import { getStage } from '../../test/util.js';
import { providerName as headerProvider, SimpleHeader } from '../headerSimple.js';

describe('the lw-header-simple custom element', () => {
  beforeAll((done) => {
    // wait for lw-header to bootstrap
    AppContext.get().then(
      (cx) => {
        cx.onStart(
          { header: headerProvider },
          async (/* toolBox */) => {
            done();
          },
        );
      },
    );
  });

  it('Has a static observedAttributes property', () => {
    const propList = SimpleHeader.observedAttributes;
    expect(propList.length).toBe(1);
    expect(propList[0]).toBe('title');
  });

  it('Can allocate a SimpleHeader object', () => {
    const hd = new SimpleHeader();
    expect(hd).toBeDefined();
  });

  it("Listens for attribute change events on 'title' attribute", (done) => {
    const hd = new SimpleHeader();
    const stage = getStage('changeCallback', 'Testing attributeChangedCallback');
    stage.appendChild(hd);
    spyOn(hd, '_render').and.callThrough();
    hd.setAttribute('title', 'TestTitle');
    expect((hd._render as any).calls.any()).toBe(true);
    // render is async
    sleep(10).then(
      () => {
        expect(hd.querySelector('.lw-header__title').textContent.trim()).toBe('TestTitle');
        done();
      },
    );
  });

  it('Can render a SimpleHeader', (done) => {
    const stage = getStage('header1', "SimpleHeader - 'Test Title'");
    const hd = document.createElement('lw-header-simple');
    stage.appendChild(hd);
    hd.setAttribute('title', 'Test Title');
    // render is async
    sleep(10).then(
      () => {
        expect(stage.querySelector('.lw-header__title').textContent.trim()).toBe('Test Title');
        done();
      },
    );
  });
});
