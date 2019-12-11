/**
 * Little lazy loader with memory and mutex
 */
export class LazyThing<T> {
    // tslint:disable-next-line
    private _thing: Promise<T> = null;
    private reload: Promise<T> = null;
    private ttlSecs = -1;
    // tslint:disable-next-line
    private _lastLoadTime = 0;
    private loader: () => Promise<T> = null;

    /**
     * @param loader lambda that loads the thing on demand
     * @param ttlSecs number of seconds to cache the thing before triggering a reload
     */
    constructor(loader: () => Promise<T>, ttlSecs = -1) {
        this.loader = loader;
        this.ttlSecs = ttlSecs;
    }

    /**
     * Refresh if ttl expired or force true
     * @param force
     * @return cached this.thing if force is false, else the promise
     *                that loads the new data when reload is done
     */
    public refreshIfNecessary(force: boolean = false): Promise<T> {
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
                this.reload = this.loader();
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
                    },
                );
            }
            if (force) {
                return this.reload;
            } else {
                return this._thing;
            }
        }
        this._thing = this.loader();
        this._thing.finally(() => {
            this._lastLoadTime = Date.now();
        });
        return this._thing;
    }

    get thing(): Promise<T> {
        return this.refreshIfNecessary(false);
    }

    /**
     * Date.now of last load attempt completion -
     * whether it succeeded or not.  Zero until after
     * the first call to .thing
     */
    get lastLoadTime() {
        return this._lastLoadTime;
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise(
        (resolve) => {
            setTimeout(() => resolve(), ms);
        },
    );

}

/**
 * Wrap the async function lambda so that
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
