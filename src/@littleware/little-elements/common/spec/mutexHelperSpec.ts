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
        const lazy = new LazyThing(() => Promise.resolve("frickjack " + Date.now()), 1);
        const thing1 = lazy.thing;
        const thing2 = lazy.thing;
        expect(thing1).toBe(thing2);
        const v = await Promise.all([thing1, thing2]);
        expect(v.length).toBe(2);
        expect(v[0]).toBe(v[1]);
        await sleep(1500);
        // trigger reload
        const thing3 = await lazy.thing;
        // new value loaded
        const thing4 = await lazy.thing;
        expect(thing4).not.toBe(v[0]);
        done();
    });
});
