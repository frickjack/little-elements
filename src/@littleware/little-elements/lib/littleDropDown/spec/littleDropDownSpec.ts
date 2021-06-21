import AppContext from '../../../common/appContext/appContext.js';
import { sleep } from '../../../common/mutexHelper.js';
import { getStage } from '../../test/util.js';
import { providerName as ddProvider } from '../littleDropDown.js';

const testContext = 'littleware/lib/littleDropDown/spec';

describe('the lw-drop-down custom element', () => {
  beforeAll((done) => {
    // wait for lw-drop-down to bootstrap
    AppContext.get().then(
      (cx) => {
        cx.onStart(
          { dropDown: ddProvider },
          async () => {
            done();
          },
        );
      },
    );
  });

  it('Can dance', () => {
    expect(true).toBe(true);
  });

  it('Can render a lw-drop-down', (done) => {
    const stage = getStage('dropdown1', 'LittlelittleDropDown');
    const elem = document.createElement('lw-drop-down');
    elem.setAttribute('context', testContext);
    stage.appendChild(elem);
    sleep(1).then(
      () => {
        expect(stage.querySelectorAll('lw-drop-down').length).toBe(1);
        done();
      },
    );
  });
});

AppContext.get().then(
  (cx) => {
    cx.putDefaultConfig(testContext, {
      items: [
        {
          className: 'lw-dd-test__label1',
          href: '#lw-dd-test/whatever1',
          labelKey: 'test-label1',
        },
        {
          className: 'lw-dd-test__label2',
          href: '#lw-dd-test/whatever2',
          labelKey: 'test-label2',
        },
      ],
      root: {
        className: 'lw-dd-test',
        href: '#whatever',
        labelKey: 'little-hamburger',
      },
    });
  },
);
