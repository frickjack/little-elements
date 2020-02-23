/**
 * Simple thenable factory typeclass
 */
export interface Provider<T> {
    get(): Promise<T>;
    then<R>(lambda: (x: T) => R|PromiseLike<R>): Provider<R>;
}

/**
 * Little lazy singleton provider with memory and mutex
 * that self-updates on get() after a ttl
 * expires.
 */
export class LazyProvider<T> implements PromiseLike<T>, Provider<T> {
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

    public get(): Promise<T> {
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
     * Shortcut for new LazyProvider(() => parent.thing.then(...))
     * Note that refresh() on the child thing
     * does not force a refresh on the parent, and
     * vice versa, but the child inherits the ttl from
     * its parent.
     *
     * @param lambda
     */
    public then<R>(lambda: (x: T) => R|PromiseLike<R>): LazyProvider<R> {
        const result = new LazyProvider(() => {
            return this.refreshIfNecessary(false).next.then((thing) => lambda(thing));
        }, this.ttlSecs);
        return result;
    }
}
