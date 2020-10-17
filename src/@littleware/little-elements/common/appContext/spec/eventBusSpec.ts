import { getBus, Event, EventBus } from "../eventBus.js";

describe ("the eventBus", function() {
    let bus:EventBus = null;

    beforeAll(async (done) => {
        bus = await getBus();
        done();
    });

    it("can add and remove listeners", async (done) => {
        expect(bus).not.toBeNull();
        const listener = () => {}
        expect(bus.addListener('little-test', 'eventBusSpec', listener)).toBe(true);
        expect(bus.addListener('little-test', 'eventBusSpec', listener)).toBe(false);
        expect(bus.removeListener('little-test', 'eventBusSpec', listener)).toBe(true);
        expect(bus.removeListener('little-test', 'eventBusSpec', listener)).toBe(false);
        done();
    });

    it("can dispatch events with some data", function(done) {
        expect(bus).not.toBeNull();
        const testCategory = 'little-test';
        const testDetail = 'eventBusSpec2';
        const testData = { a: "whatever" };
        let counter = 0;

        const addListener = () => {
            const listener = (ev:Event) => {
                expect(ev.category).toBe(testCategory);
                expect(ev.detail).toBe(testDetail);
                expect(ev.data).toBe(testData);
                expect(counter).toBeGreaterThan(0); // dispatch is async
                expect(typeof listener).toBe('function');
                expect(bus.removeListener(testCategory, testDetail, listener)).toBe(true);
                counter += 1;
                if (counter === 2) {
                    done();
                }
            };
            expect(bus.addListener(testCategory, testDetail, listener)).toBe(true);
            return listener;
        };

        addListener();
        addListener();
        bus.dispatch(testCategory, testDetail, testData);
        expect(counter).toBe(0);
        counter += 1;
    });
});
