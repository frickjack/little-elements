import { backoff, backoffIterator, LazyThing, sleep, squish } from "../mutexHelper.js";

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
        const thing5 = await lazy.refreshIfNecessary(false).next;
        expect(thing5).toBe(thing4);
        const thing6 = await lazy.refreshIfNecessary(true).next;
        // console.log(`test thing 5: ${thing5 === thing6}`);
        expect(thing6).not.toBe(thing5);
        expect(lazy.lastLoadTime).toBeGreaterThan(startMs);
        done();
    });

    it("can transform a thing", async (done) => {
        let counter = 0;
        const lazy = new LazyThing(() => sleep(100).then(() => { counter += 1; return counter; }), 1,
        ).then((num) => `The number is ${num}`);

        // first value should be 1
        const str1 = await lazy.thing;
        expect(str1).toBe(`The number is 1`);
        // second value will still be 1, but it triggered an update
        const str2 = await sleep(1500).then(() => lazy.thing);
        expect(str2).toBe(str1);
        // third value should pickup the update
        const str3 = await sleep(200).then(() => lazy.thing);
        expect(str3).toBe(`The number is 2`);
        done();
    });

    it("can setup a backoff iterator", () => {
        const numRetries = 3;
        const backoffMs = 100;
        const it = backoffIterator(numRetries, backoffMs);
        let count = 0;
        let lastValue = 0;
        for (const value of it) {
            if (count === 1) { // first retry
                expect(value).toBeGreaterThan(backoffMs / 2);
                expect(value).toBeLessThan(backoffMs * 3 / 2);
            } else {
                expect(value).toBe(lastValue + lastValue);
            }
            lastValue = value;
            expect(count).toBeLessThan(numRetries + 1);
            count += 1;
        }
        expect(count).toBe(numRetries + 1);
        for (let i = 0; i < 2; i++) {
            const last = it.next();
            expect(last.done).toBe(true);
            expect(last.value).toBe(lastValue + lastValue);
        }
    });

    it("can backoff and retry to failure", (done) => {
        const maxRetries = 3;
        const backoffMs = 100;
        let startMs = Date.now();
        let lastRunMs = 0;
        let count = 0;

        const lambda = () => {
            const nowMs = Date.now();
            if (lastRunMs) {
                expect(nowMs - lastRunMs).toBeGreaterThan(count * backoffMs / 2);
            }
            expect(count).toBeLessThan(maxRetries + 2);
            count += 1;
            lastRunMs = nowMs;
            return Promise.reject("always fail");
        };

        const proxy = backoff(lambda, maxRetries, backoffMs);
        proxy().then(
            () => {
                done.fail("lambda should always fail");
            },
        ).catch(
            () => {
                expect(count).toBe(maxRetries + 2);
                expect(Date.now() - startMs).toBeGreaterThan(backoffMs);
                count = 0;
                lastRunMs = 0;
                startMs = Date.now();
                return proxy();
            },
        ).catch(
            // ensure proxy runs are indempotent
            () => {
                expect(count).toBe(maxRetries + 2);
                expect(Date.now() - startMs).toBeGreaterThan(backoffMs);
                done();
            },
        );
    });

    it("can backoff and retry to success", (done) => {
        const maxRetries = 3;
        const backoffMs = 100;
        const startMs = Date.now();
        let lastRunMs = 0;
        let count = 0;

        const lambda = (message) => {
            const nowMs = Date.now();
            if (lastRunMs) {
                expect(nowMs - lastRunMs).toBeGreaterThan(count * backoffMs / 2);
            }
            expect(count).toBeLessThan(maxRetries + 2);
            count += 1;
            lastRunMs = nowMs;
            if (count < 2) {
                return Promise.reject(`fail on ${count}`);
            }
            return Promise.resolve(`${message} on ${count}`);
        };

        const proxy = backoff(lambda, maxRetries, backoffMs);
        proxy("success").then(
            (str) => {
                expect(str).toBe("success on 2");
                count = 0;
                lastRunMs = 0;
                return proxy("success");
            },
        ).then(
            // ensure proxy invocations are indempotent
            (str) => {
                expect(str).toBe("success on 2");
                done();
            },
        ).catch(
            () => {
                done.fail("backoff should succeed on 2nd retry");
            },
        );
    });
});
