import { sleep } from '../mutexHelper.js';
import { LazyProvider, passThroughProvider, singletonProvider } from '../provider.js';

describe('the provider tools', () => {
  it('can lazy load a thing with reload', async (done) => {
    const startMs = Date.now();
    let counter = 0;
    const lazy = new LazyProvider(() => sleep(100).then(() => { counter += 1; return `frickjack  + ${counter++}-${Date.now()}`; }), 1);
    const thingPromise1 = lazy.get();
    const thingPromise2 = lazy.get();
    expect(thingPromise1).toBe(thingPromise2);
    const v = await Promise.all([thingPromise1, thingPromise2]);
    expect(v.length).toBe(2);
    expect(v[0]).toBe(v[1]);
    await sleep(1500);
    // trigger reload
    // eslint-disable-next-line
    const thing3 = await lazy.get();
    // wait for new value to load
    await sleep(200);
    const thing4 = await lazy.get();
    // console.log(`test thing 4: ${thing4 === v[0]}`);
    expect(thing4).not.toBe(v[0]);
    const thing5 = await lazy.refreshIfNecessary(false).next;
    expect(thing5).toBe(thing4);
    const thing6 = await lazy.refreshIfNecessary(true).next;
    // console.log(`test thing 5: ${thing5 === thing6}`);
    expect(thing6).not.toBe(thing5);
    expect(lazy.lastLoadTime).toBeGreaterThan(startMs);
    done();
  });

  it('can transform a thing', async (done) => {
    let counter = 0;
    const lazy = new LazyProvider(() => sleep(100).then(() => { counter += 1; return counter; }), 1).transform((num) => `The number is ${num}`);

    // first value should be 1 - note that LazyProvider is "then-able" ...
    const str1 = await lazy.get();
    expect(str1).toBe('The number is 1');
    // second value will still be 1, but it triggered an update
    const str2 = await sleep(1500).then(() => lazy.get());
    expect(str2).toBe(str1);
    // third value should pickup the update
    const str3 = await sleep(200).then(() => lazy.get());
    expect(str3).toBe('The number is 2');
    done();
  });

  it('does not cache when ttl is zero', (done) => {
    let counter = 0;
    const provider = passThroughProvider(() => counter++);
    let it = 0;
    const handler = (result:number) => {
      const shouldbe = it;
      expect(result).toBe(shouldbe);
      it += 1;
      if (it < 10) {
        provider.get().then(handler);
      } else {
        done();
      }
    };
    provider.get().then(handler);
  });

  it('supports singletons', async (done) => {
    const thing = 'frickjack';
    const provider = singletonProvider(() => thing);
    const thing1 = await provider.get();
    const thing2 = await provider.get();
    expect(thing1).toBe(thing2);
    expect(thing).toBe(thing1);
    done();
  });
});
