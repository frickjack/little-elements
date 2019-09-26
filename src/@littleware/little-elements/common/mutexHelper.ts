/**
 * Little lazy loader with memory and mutex
 */
export class LazyThing<T> {
    private thing: Promise<T> = null;
    private loader: () => Promise<T> = null;

    constructor(loader: () => Promise<T>) {
        this.loader = loader;
    }

    public getThing(): Promise<T> {
        if (this.thing) {
            return this.thing;
        }
        this.thing = this.loader();
        return this.thing;
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
