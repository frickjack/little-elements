import { providerName as busKey, EventBus, Event } from "../eventBus.js";
import { providerName as stateKey, SharedState } from "../sharedState.js";
import { AppContext, getTools } from "../appContext.js";
import { Barrier } from '../../mutexHelper.js';

interface Tools {
    bus: EventBus;
    state: SharedState;
}

describe("the sharedState helper", function() {
    let tools:Tools = null;

    beforeAll(async (done) => {
        const cx = await AppContext.get();
        cx.onStart(
            { bus: busKey, state: stateKey },
            async (toolBox) => {
                tools = (await getTools(toolBox)) as Tools;
                done();
            }
        );
    });

    it("integrates with the app context", function() {
        expect(tools).toBeDefined();
        expect(tools).not.toBeNull();
    });

    const testKeyPrefix = "lw-test/shardStateSpec";

    it("initializes empty state", async (done) => {
        const testKey = `${testKeyPrefix}/init`;
        const state = await tools.state.getState(testKey);
        expect(state).toEqual({});
        done();
    });

    it("triggers events on state change", async (done) => {
        const testKey = `${testKeyPrefix}/change`;
        const testValue = { "whatever": "bla bla", "boris": "turkey" };
        const listenKey = `lw-sc:${testKey}`;
        const doneBarrier = new Barrier<string>();
        const listener = (ev:Event) => {
            expect(ev.data.old).toEqual({});
            expect(ev.data.new).toEqual(testValue);
            tools.bus.removeListener(listenKey, listener);
            doneBarrier.signal("ok");
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
