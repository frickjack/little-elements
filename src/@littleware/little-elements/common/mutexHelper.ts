
export function sleep(ms: number): Promise<void> {
    return new Promise(
            (resolve) => {
                if (ms) {
                    setTimeout(() => resolve(), ms);
                } else {
                    resolve();
                }
            },
        );
}

/**
 * squish (debounce) the async function lambda so that
 * when a call to lambda is in flight subsequent
 * calls to lambda will short-circuit to return the
 * Promise from the already running call.
 *
 * @param lambda
 * @return squished lambda
 */
export function squish<T>(lambda: () => Promise<T>): () => Promise<T> {
    let inFlight: Promise<T> = null;
    return () => {
        if (!inFlight) {
            inFlight = lambda();
            inFlight.finally(() => { inFlight = null; } );
        }
        return inFlight;
    };
}

export interface NumberIterator {
    next(): {done: boolean, value: number};
    [Symbol.iterator](): NumberIterator;
}

/**
 * Return an iterator with the number of ms to
 * backoff before each retry
 *
 * @param maxRetries silently clamped to minimum 1, max 10
 * @param backoffMs silently clamped to minimum 100ms, max 10000ms
 * @return iterable iterator with backoff values starting from zero
 */
export function backoffIterator(maxRetriesIn, backoffMsIn): NumberIterator {
    const maxRetries = (() => {
        let valid = maxRetriesIn;
        if (valid < 1) {
            valid = 1;
        }
        if (valid > 10) {
            valid = 10;
        }
        return valid;
    })();
    const backoffMs = (() => {
        let valid = backoffMsIn;
        if (valid < 100) {
            valid = 100;
        }
        if (valid > 10000) {
            valid = 10000;
        }
        return valid;
    })();
    const step = (() => {
        let jitter = Math.floor(Math.random() * backoffMs / 10);
        if (Math.random() < 0.5) {
            jitter = 0 - jitter;
        }
        return backoffMs + jitter;
    })();

    let count = 0;
    let lastResult = 0;

    return {
        next() {
            const result = {
                done: count > maxRetries,
                value: lastResult + lastResult,
            };
            if (!result.done) {
                lastResult = result.value || step / 2;
                count += 1;
            }
            return result;
        },
        [Symbol.iterator]() { return this; },
    };
}

/**
 * backoff helper
 *
 * @param lambda function to backoff and retry as necessary
 * @param it iterator tracks retries
 * @param args arguments to pass through to lambda
 */
function backoffProxy<T>(lambda: (...args) => Promise<T>, it: NumberIterator, ...args: any[]): Promise<T> {
    const next = it.next();
    const action = sleep(next.value).then(() => lambda.apply(this, args));
    if (next.done) {
        return action;
    } else {
        return action.catch(
            (err) => {
                return backoffProxy(lambda, it, args);
            },
        );
    }
}

/**
 * Return a lambda that retries up to
 * maxRetries times with jitter exponential backoff
 * of backoffMs, 2*backoffMs, ... 2^n*backoffMs
 * capped at a 10000 ms backoff with a jitter of backoffMs/10.
 *
 * Ex: const retryFetch = backoff(function(url, options) { return fetch(url,options); });
 *
 * @param lambda
 * @param maxRetries default 3, silently clamped to minimum 1, max 10
 * @param backoffMs default 500, silently clamped to minimum 100ms, max 10000ms
 */
export function backoff<T>(lambda: (...args) => Promise<T>, maxRetries= 10, backoffMs= 500): (...args) => Promise<T> {
    // tslint:disable-next-line
    return function(...args) {
        const it = backoffIterator(maxRetries, backoffMs);
        return backoffProxy(lambda, it, args);
    };
}

/**
 * Proxy that invokes lambda once, and caches the result
 *
 * @param lambdaOnce to invoke just once
 * @param lambdaTwice to invoke the second+ time called - default
 *                   just returns the given cached value
 */
export function once<T>(lambdaOnce: () => T, lambdaTwice: (T) => T = (t) => t): () => T {
    let hasRun = false;
    let cache = null;
    return () => {
        if (hasRun) { return lambdaTwice(cache); }
        hasRun = true;
        cache = lambdaOnce();
        return cache;
    };
}

/**
 * Barrier that resolves or rejects a promise
 * when signaled or canceled
 */
export class Barrier<T> {
    private resolver: (value: T) => void = null;
    private rejecter: (err: any) => void = null;
    private promise: Promise<T> = null;
    private barrierState = "unresolved";

    constructor() {
        this.promise = new Promise(
            (resolve, reject) => {
                this.resolver = resolve;
                this.rejecter = reject;
            },
        );
    }

    /**
     * Resolve the wait() promise with value
     *
     * @param value
     * @return true if value propagated to waiters,
     *      false if barrier was already signaled
     *      or canceled
     */
    public signal(value: T|Promise<T>): boolean {
        if (this.state === "unresolved") {
            Promise.resolve(value).then((v) => { this.resolver(v); });
            this.barrierState = "resolved";
            return true;
        }
        return false;
    }

    /**
     * Propagate an error to waiters
     *
     * @param err
     * @return true if value propagated to waiters,
     *      false if barrier was already signaled
     *      or canceled
     */
    public cancel(err: any): boolean {
        if (this.state === "unresolved") {
            this.rejecter(err);
            this.barrierState = "rejected";
            return true;
        }
        return false;
    }

    /**
     * @return unresolved, resolved, or rejected
     */
    get state(): string { return this.barrierState; }

    public wait(): Promise<T> {
        return this.promise;
    }
}

/**
 * Helper rate limiting, circuite breaking, and mutual exclusion.
 * Note that throttle and serialize can be used in conjuction with
 * backoff and squish to retry and debounce requests.
 */
// tslint:disable-next-line
export class Mutex {

    get maxQueueLen() { return this.maxQueueLenVal; }
    get maxConcurrency() { return this.maxConcurrencyVal; }
    private maxConcurrencyVal: number;
    private maxReqsPerSec: number;
    private rateWindowEnd = new Date(Date.now() + 5000).getTime();
    private rateWindowCount = 0;
    private maxQueueLenVal: number;
    private numRunning: number = 0;
    private waitQueue: Array<Barrier<void>> = [];

    /**
     * @param maxConcurrency max number of concurrently running
     *     requests (subsequent requests are queued) - default is 4
     * @param maxReqsPerSec max number of requests per second
     *     before throttling kicks in - must be greater than maxConcurrency
     * @param maxQueueLen max length of the throttle queue before a
     *     fast fail circuit breaker kicks in
     */
    constructor(maxConcurrency= 4, maxReqsPerSec = 20, maxQueueLen= 20) {
        this.maxConcurrencyVal = maxConcurrency;
        this.maxReqsPerSec = maxReqsPerSec;
        this.maxQueueLenVal = maxQueueLen;
    }

    /**
     * Aquire the mutex, then invoke lambda, then release the mutex
     * @param lambda
     */
    public enter<T>(lambda: () => Promise<T>): Promise<T> {
        // push the request onto the wait queue
        const barrier = new Barrier<void>();
        if (this.waitQueue.length + 1 > this.maxQueueLen) {
            return Promise.reject("mutex throttle");
        }
        this.waitQueue.push(barrier);
        this.popTheQ();
        const result = barrier.wait().then(() => lambda());
        result.finally(() => this.exit());
        return result;
    }

    /**
     * throttle creates a proxy that limits the number of concurrently running requests
     * to Mutex.maxConcurrency and Mutex.maxReqsPerSec by
     * queueing them up, and circuit breaks (fast fails) requests once some
     * queue length threshold is exceeded, so
     * an asynchronous client could overload a backend service with requests.
     *
     * @param lambda that should be throttled
     * @return throttled wrapper around lambda
     */
    public throttle<T>(lambda: (...args) => Promise<T>): (...args) => Promise<T> {
        return (...args) => this.enter(
                () => lambda(args),
            );
    }

    private popTheQ() {
        const now = Date.now();
        if (now > this.rateWindowEnd) {
            // 5 second rate limit window
            this.rateWindowEnd = now + 5000;
            this.rateWindowCount = 0;
        }
        // release rate-limitted requests
        for (
            let count = 0;
            count + this.numRunning < this.maxConcurrency
                && count + this.rateWindowCount < this.maxReqsPerSec * 5
                && this.waitQueue.length > 0;
            count += 1
        ) {
            const barrier: Barrier<void> = this.waitQueue.shift();
            if (barrier) {
                this.numRunning += 1;
                this.rateWindowCount += 1;
                barrier.signal();
            }
        }
        if (this.numRunning === 0 && this.waitQueue.length > 0) {
            // rate limiting has kicked in - wake up the queue
            // when a new rate window opens
            sleep(this.rateWindowEnd - now + 50).then(
                () => this.popTheQ(),
            );
        }
    }

    private exit() {
        if (this.numRunning > 0) {
            --this.numRunning;
        }
        this.popTheQ();
    }

}

/**
 * Map the given asynchronous function over the given list
 * synchronously, so that at most batchSize elements of the list
 * are in process simultaneously
 *
 * @param {[I]} list
 * @param {I => T} lambda
 * @param {int} batchSize max number of elements to run in parallel - between 1 and 100, default 10
 * @param {Promise<T>} result initial list to append to - defaults to []
 */
export function pmap<T, R>(list: T[], lambda: (T) => Promise<R>, batchSize: number= 10, result: R[]= []): Promise<R[]> {
    let n = batchSize;
    if (n < 1) {
        n = 1;
    }
    if (n > 100) {
        n = 100;
    }
    if (list && list.length > 0) {
      return Promise.all(list.slice(0, n).map((it) => lambda(it))).then(
        (batchResult) => {
          return pmap(list.slice(n), lambda, n, result.concat(batchResult));
        },
      );
    } else {
      return Promise.resolve(result);
    }
  }

  /**
   * Make a deep copy of the given object, and
   * optionally freeze.
   *
   * @param thing
   * @param freeze
   */
export function deepCopy<T>(thing: T, freeze= false): T {
    let result = null;

    switch (typeof thing) {
        case "object":
            if (Array.isArray(thing)) {
                result = [];
                for (const it of thing) {
                    result.push(deepCopy(it, freeze));
                }
            } else {
                result = {};
                for (const [key, value] of Object.entries(thing)) {
                    result[key] = deepCopy(value, freeze);
                }
            }
            if (freeze) {
                Object.freeze(result);
            }
            break;
        default:
            result = thing;
            break;
    }
    return result;
  }
