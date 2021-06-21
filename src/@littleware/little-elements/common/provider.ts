/**
 * Simple composable factory typeclass
 */
export interface Provider<T> {
  get(): Promise<T>;
  transform<R>(lambda: (x: T) => R | PromiseLike<R>): Provider<R>;
}

/**
 * Little lazy singleton provider with memory and mutex
 * that self-updates on get() after a ttl
 * expires.
 *
 * - if ttl < 0, then the LazyProvider acts as a LazySingleton
 * - if ttl === 0, then the LazyProvider calls through to the loader
 *             on every call - there is no cache
 * - if ttl > 0, then the provider does lazy refresh
 *             once the ttl expires
 */
export class LazyProvider<T> implements Provider<T> {
  // eslint-disable-next-line
  private _thing: Promise<T> = null;

  private reload: Promise<T> = null;

  private ttlSecs = -1;

  // eslint-disable-next-line
  private _lastLoadTime = 0;

  private loader: () => T | Promise<T> = null;

  /**
     * @param loader lambda that loads the thing on demand
     * @param ttlSecs number of seconds to cache the thing before triggering a reload,
     *          default to never reload (-1)
     */
  constructor(loader: () => T | Promise<T>, ttlSecs = -1) {
    this.loader = loader;
    this.ttlSecs = ttlSecs;
  }

  /**
     * Refresh if ttl expired or force true
     * @param force
     * @return cached this.thing and the promise
     *    that loads the new data when reload is done
     */
  public refreshIfNecessary(force = false): { current: Promise<T>, next: Promise<T> } {
    // ttl === 0 means always invoke the loader
    // ttl < 0 means invoke the loader once, and cache the result forever as a singleton
    if (this._thing && this.ttlSecs !== 0) {
      // trigger reload in background if necessary
      if (
        this.ttlSecs > 0 // there's a ttl
                && this.reload === null // not reloading already
                && this._lastLoadTime > 0 // initial load complete
                && (force // reload force requested
                    || ( // or there's a TTL and it expired
                      Date.now() - this._lastLoadTime > this.ttlSecs * 1000)
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
          () => {
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
  public transform<R>(lambda: (x: T) => R | PromiseLike<R>): LazyProvider<R> {
    const result = new LazyProvider(
      () => this.refreshIfNecessary(false).next.then(
        (thing) => lambda(thing),
      ),
      this.ttlSecs,
    );
    return result;
  }
}

export function singletonProvider<T>(loader: () => T | Promise<T>): Provider<T> {
  return new LazyProvider(loader);
}

export function passThroughProvider<T>(loader: () => T | Promise<T>): Provider<T> {
  return new LazyProvider(loader, 0);
}

export function asFactory<T>(provider: LazyProvider<T>): () => Promise<T> {
  return () => provider.get();
}
