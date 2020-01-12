/**
 * Little lazy loader with memory and mutex
 */
export class LazyThing<T> implements PromiseLike<T> {
    // tslint:disable-next-line
    private _thing: Promise<T> = null;
    private reload: Promise<T> = null;
    private ttlSecs = -1;
    // tslint:disable-next-line
    private _lastLoadTime = 0;
    private loader: () => T|Promise<T> = null;

    /**
     * @param loader lambda that loads the thing on demand
     * @param ttlSecs number of seconds to cache the thing before triggering a reload,
     *          default to never reload
     */
    constructor(loader: () => T|Promise<T>, ttlSecs = -1) {
        this.loader = loader;
        this.ttlSecs = ttlSecs;
    }

    /**
     * Refresh if ttl expired or force true
     * @param force
     * @return cached this.thing and the promise
     *    that loads the new data when reload is done
     */
    public refreshIfNecessary(force: boolean = false): { current: Promise<T>, next: Promise<T> } {
        if (this._thing) {
            // trigger reload in background if necessary
            if (
                null === this.reload       // not reloading already
                && this._lastLoadTime > 0  // initial load complete
                && (force                  // reload force requested
                    || (this.ttlSecs > 0   // or there's a TTL and it expired
                    && Date.now() - this._lastLoadTime > this.ttlSecs * 1000)
                    )
             ) {
                this.reload = Promise.resolve(this.loader());
                this.reload.then(
                    () => {
                        this._lastLoadTime = Date.now();
                        this._thing = this.reload;
                        this.reload = null;
                    },
                ).catch(
                    (err) => {
                        this._lastLoadTime = Date.now();
                        this.reload = null;
                        // leave the previously loaded thing in place
                    },
                );
            }
            return { current: this._thing, next: this.reload || this._thing };
        }

        // initial load ...
        this._thing = Promise.resolve(this.loader());
        this._thing.finally(() => {
            this._lastLoadTime = Date.now();
        });
        return { current: this._thing, next: this._thing };
    }

    get thing(): Promise<T> {
        return this.refreshIfNecessary(false).current;
    }

    /**
     * Date.now of last load attempt completion -
     * whether it succeeded or not.  Zero until after
     * the first call to .thing
     */
    get lastLoadTime() {
        return this._lastLoadTime;
    }

    /**
     * Apply a transformation on this thing.
     * Shortcut for new LazyThing(() => parent.thing.then(...))
     * Note that refresh() on the child thing
     * does not force a refresh on the parent, and
     * vice versa, but the child inherits the ttl from
     * its parent.
     *
     * @param lambda
     */
    public then<R>(lambda: (x: T) => R|PromiseLike<R>): LazyThing<R> {
        const result = new LazyThing(() => {
            return this.refreshIfNecessary(false).next.then((thing) => lambda(thing));
        }, this.ttlSecs);
        return result;
    }
}

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
export function squish(lambda: () => Promise<any>): () => Promise<any> {
    let inFlight: Promise<any> = null;
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

interface MutexQEntry {
    resume();
    wait(): Promise<any>;
}

/**
 * Helper rate limiting, circuite breaking, and mutual exclusion.
 * Note that throttle and serialize can be used in conjuction with
 * backoff and squish to retry and debounce requests.
 */
// tslint:disable-next-line
export class Mutex {
    public maxConcurrency: number;
    public maxRate: number;
    public maxQueueLen: number;
    public numRunning: number = 0;

    /**
     * @param maxConcurrency max number of concurrently running requests (subsequent requests are queued) - default is 4
     * @param maxRate max number of requests per second before throttling kicks in - must be greater than maxConcurrency
     * @param maxQueueLen max length of the throttle queue before a fast fail circuit breaker kicks in
     */
    constructor(maxConcurrency= 4, maxRate = 20, maxQueueLen= 20) {
        throw new Error("not yet implemented");
    }

    public wait(): Promise<void> {
        const qEntry = {
            signal: null,
        };
        const p = new Promise<void>((resolve) => {
            qEntry.signal = resolve;
        });

        return p;
    }

    public bean<T>(lambda: () => Promise<T>, serialize= false): Promise<T> {
        if (this.numRunning < this.maxConcurrency) {
            ++this.numRunning;
            const result = lambda();
            result.finally(() => {
                --this.numRunning;
            });
            return result;
        }

        return null;
    }

    /**
     * throttle creates a proxy that limits the number of concurrently running requests
     * to Mutex.maxConcurrency and Mutex.maxRate by
     * queueing them up, and circuit breaks (fast fails) requests once some
     * queue length threshold is exceeded, so
     * an asynchronous client could overload a backend service with requests.
     *
     * @param lambda that should be throttled
     * @return throttled wrapper around lambda
     */
    public throttle<T>(lambda: (...args) => Promise<T>): (...args) => Promise<T> {
        throw new Error("not yet implemented");
    }

    /**
     * serialize limits the number of concurrently running requests to 1 by
     * queueing them up, and circuit breaks (fast fails) requests once some
     * queue length threshold is exceeded.  Once a serialized request is queued -
     * the runtime waits for all running requests to finish, then executes
     * the serialized request, and resumes queue processing after the request completes.
     *
     * @param lambda that should be throttled
     * @return throttled wrapper around lambda
     */
    public serialize<T>(lambda: (...args) => Promise<T>): (...args) => Promise<T> {
        throw new Error("not yet implemented");
    }

}
