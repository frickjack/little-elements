import { LazyThing, sleep, squish } from "../mutexHelper.js";

describe( "the littleware.mutexHelper", () => {
    it("can sleep for a few seconds", (done) => {
        const startMs = Date.now();
        sleep(3000).then(
            () => {
                const endMs = Date.now();
                expect(endMs - startMs).toBeGreaterThan(2900);
                done();
            },
        );
    });
    it("can squish a lambda to avoid overlapping calls", (done) => {
        const lambda = squish(() => sleep(1000));
        const s1 = lambda();
        const s2 = lambda();
        expect(s1).toBe(s2);
        s2.then(() => {
            const s3 = lambda();
            expect(s3).not.toBe(s2);
            done();
        });
    });

    it("can lazy load a thing with reload", async (done) => {
        const startMs = Date.now();
        let counter = 0;
        const lazy = new LazyThing(() => sleep(100).then(() => { counter += 1; return `frickjack  + ${counter++}-${Date.now()}`; }), 1);
        const thingPromise1 = lazy.thing;
        const thingPromise2 = lazy.thing;
        expect(thingPromise1).toBe(thingPromise2);
        const v = await Promise.all([thingPromise1, thingPromise2]);
        expect(v.length).toBe(2);
        expect(v[0]).toBe(v[1]);
        await sleep(1500);
        // trigger reload
        const thing3 = await lazy.thing;
        // wait for new value to load
        await sleep(200);
        const thing4 = await lazy.thing;
        // console.log(`test thing 4: ${thing4 === v[0]}`);
        expect(thing4).not.toBe(v[0]);
        const thing5 = await lazy.refreshIfNecessary(false);
        expect(thing5).toBe(thing4);
        const thing6 = await lazy.refreshIfNecessary(true);
        // console.log(`test thing 5: ${thing5 === thing6}`);
        expect(thing6).not.toBe(thing5);
        expect(lazy.lastLoadTime).toBeGreaterThan(startMs);
        done();
    });
});
