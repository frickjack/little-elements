import { backoff, backoffIterator, Barrier, deepCopy, Mutex, once, sleep, squish } from "../mutexHelper.js";

describe("the littleware.mutexHelper", () => {
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

    it("can setup a one-call cache-proxy", () => {
        const count = (() => {
            let counter = 0;
            return () => counter++;
        })();
        const cacheCount = once(count);
        expect(cacheCount()).toBe(0);
        expect(cacheCount()).toBe(0);
        expect(count()).toBe(1);
        expect(cacheCount()).toBe(0);
    });

    it("can rate limit access to a critical section", (done) => {
        const mx = new Mutex();
        let counter = 0;
        const batch = [];
        for (let i = 0; i < mx.maxQueueLen + mx.maxConcurrency; ++i) {
            const num = i;
            const task = mx.enter(() => sleep(100).then(
                () => {
                    counter += 1;
                    return counter;
                },
            )).then(
                (numPlus1) => {
                    expect(numPlus1).toBe(num + 1);
                },
            );
            batch.push(task);
        }
        mx.enter(() => Promise.resolve("ok")).then(
            () => { done.fail("should have been throttled"); },
            (err) => { expect(err).toBe("mutex throttle"); },
        ).then(
            () => Promise.all(batch),
        ).then(
            () => done(),
        );
    });

    it("can do a deep copy", () => {
        const testObj = {
            abc: {
                def: {
                    g: 123,
                    hij: [ { xyz: 123 }],
                },
            },
            whatever: "whatever",
        };
        const copy = deepCopy(testObj, true);
        expect(copy).not.toBe(testObj, "deepCopy creates new object");
        expect(copy.abc).not.toBe(testObj.abc);
        expect(copy.abc.def).not.toBe(testObj.abc.def);
        expect(copy.abc.def.g).toEqual(testObj.abc.def.g);
        expect(copy.abc.def.hij[0]).not.toBe(testObj.abc.def.hij[0]);
        expect(copy.abc.def.hij[0].xyz).toEqual(testObj.abc.def.hij[0].xyz);

        try {
            copy.whatever = "freeze";
            fail("assigment to frozen object should fail");
        } catch (ex) {
            expect(ex).toBeDefined();
        }
        expect(copy.whatever).toEqual(testObj.whatever, "freeze works");
    });
});

describe("the little barrier", () => {

    it("can signal and wait on a barrier", (done) => {
        const barrier = new Barrier<string>();
        const value = "frickjack";

        barrier.wait().then(
            () => barrier.wait().then((str) => str),
        ).then(
            (str) => {
                expect(str).toEqual(value);
                done();
            },
        );
        barrier.signal(value);
    });

});
