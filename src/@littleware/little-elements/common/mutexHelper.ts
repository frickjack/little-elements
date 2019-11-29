/**
 * Little lazy loader with memory and mutex
 */
export class LazyThing<T> {
    // tslint:disable-next-line
    private _thing: Promise<T> = null;
    private reload: Promise<T> = null;
    private ttlSecs = -1;
    private lastLoadTime = 0;
    private loader: () => Promise<T> = null;

    /**
     * @param loader lambda that loads the thing on demand
     * @param ttlSecs number of seconds to cache the thing before triggering a reload
     */
    constructor(loader: () => Promise<T>, ttlSecs = -1) {
        this.loader = loader;
        this.ttlSecs = ttlSecs;
    }

    public get thing(): Promise<T> {
        if (this._thing) {
            // trigger reload in background if necessary
            if (this.ttlSecs > 0 && this.lastLoadTime > 0
                && null === this.reload
                && Date.now() - this.lastLoadTime > this.ttlSecs * 1000
                ) {
                this.reload = this.loader();
                this.reload.then(
                    () => {
                        this.lastLoadTime = Date.now();
                        this._thing = this.reload;
                        this.reload = null;
                    },
                ).catch(
                    (err) => {
                        this.lastLoadTime = Date.now();
                        this.reload = null;
                    },
                );
            }
            return this._thing;
        }
        this._thing = this.loader();
        this._thing.finally(() => {
            this.lastLoadTime = Date.now();
        });
        return this._thing;
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
