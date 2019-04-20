// TODO - move this into a "common" (shared by both server side and web side code) part of little-elements

/**
 * Little lazy loader with memory and mutex
 */
export class LazyThing<T> {
    private _thing:Promise<T> = null;
    private _loader:() => Promise<T> = null;

    constructor(loader:() => Promise<T>) {
        this._loader = loader;
    }

    getThing():Promise<T> {
        if (this._thing) {
            return this._thing;
        }
        this._thing = this._loader();
        return this._thing;
    }
}

export function sleep(ms:number):Promise<void> {
    return new Promise(
        (resolve) => {
            setTimeout(() => resolve(), ms);
        }
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
export function squish(lambda:() => Promise<any>):() => Promise<any> {
    let inFlight:Promise<any> = null;
    return () => {
        if (!inFlight) {
            inFlight = lambda();
            inFlight.finally(() => { inFlight = null; } );
        }
        return inFlight;
    };
}
