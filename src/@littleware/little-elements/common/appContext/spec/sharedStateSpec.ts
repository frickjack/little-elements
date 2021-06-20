import { Barrier } from '../../mutexHelper.js';
import { AppContext, getTools } from '../appContext.js';
import { BusEvent, EventBus } from '../eventBus.js';
import { SharedState } from '../sharedState.js';

interface Tools {
  bus: EventBus;
  state: SharedState;
}

describe('the sharedState helper', () => {
  let tools: Tools = null;

  beforeAll(async (done) => {
    const cx = await AppContext.get();
    cx.onStart(
      { bus: EventBus.providerName, state: SharedState.providerName },
      async (toolBox) => {
        tools = (await getTools(toolBox)) as Tools;
        done();
      },
    );
  });

  it('integrates with the app context', () => {
    expect(tools).toBeDefined();
    expect(tools).not.toBeNull();
  });

  const testKeyPrefix = 'lw-test/shardStateSpec';

  it('initializes empty state', async (done) => {
    const testKey = `${testKeyPrefix}/init`;
    const state = await tools.state.getState(testKey);
    expect(state).toEqual({});
    done();
  });

  it('triggers events on state change', async (done) => {
    const testKey = `${testKeyPrefix}/change`;
    const testValue = { whatever: 'bla bla', boris: 'turkey' };
    const listenKey = `lw-sc:${testKey}`;
    const doneBarrier = new Barrier<string>();
    const listener = (ev: BusEvent) => {
      expect(ev.data.old).toEqual({});
      expect(ev.data.new).toEqual(testValue);
      tools.bus.removeListener(listenKey, listener);
      doneBarrier.signal('ok');
    };

    tools.bus.addListener(listenKey, listener);
    const newValue = await tools.state.changeState(testKey, (value) => {
      expect(value).toEqual({});
      return testValue;
    });
    expect(newValue).toEqual(testValue);
    await doneBarrier.wait();
    done();
  });
});
