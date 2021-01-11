import { BusEvent, EventBus, getBus } from "../eventBus.js";

describe ("the eventBus", () => {
    let bus: EventBus = null;

    beforeAll(async (done) => {
        bus = await getBus();
        done();
    });

    it("can add and remove listeners", async (done) => {
        expect(bus).not.toBeNull();
        const listener = () => null;
        expect(bus.addListener("little-test/eventBusSpec", listener)).toBe(true);
        expect(bus.addListener("little-test/eventBusSpec", listener)).toBe(false);
        expect(bus.removeListener("little-test/eventBusSpec", listener)).toBe(true);
        expect(bus.removeListener("little-test/eventBusSpec", listener)).toBe(false);
        done();
    });

    it("can dispatch events with some data", (done) => {
        expect(bus).not.toBeNull();
        const testType = "eventBusSpec2";
        const testData = { a: "whatever" };
        let counter = 0;

        const addListener = () => {
            const listener = (ev: BusEvent) => {
                expect(ev.evType).toBe(testType);
                expect(ev.data).toEqual(testData);
                expect(counter).toBeGreaterThan(0); // dispatch is async
                expect(typeof listener).toBe("function");
                expect(bus.removeListener(testType, listener)).toBe(true);
                counter += 1;
                if (counter === 2) {
                    done();
                }
            };
            expect(bus.addListener(testType, listener)).toBe(true);
            return listener;
        };

        addListener();
        addListener();
        bus.dispatch(testType, testData);
        expect(counter).toBe(0);
        counter += 1;
    });
});
