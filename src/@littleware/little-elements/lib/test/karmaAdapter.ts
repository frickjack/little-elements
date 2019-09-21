namespace littleware {
    export namespace test {
        const startCache = {
            lambda: null as Function,
            arguments: [],
            thisArg: null
        };

        /**
         * Monkey patch karma to stop it from starting until after 
         * all our modules have loaded - at which point the 'main' module
         * should invoke littleware.test.startKarma (below).
         * This is similar (I think) to the trick the karma-requirejs module
         * plays
         * 
         * @param win alias for window typecast to 'any'
         * @return true if karma is on the page and monkey patches
         */
        function patchKarma(win:any) {
            if (win.__karma__) {
                startCache.lambda = win.__karma__.start as Function;
                win.__karma__.start = function() {
                    console.log('Ignoring initial __karma__.start, saving arguments');
                    startCache.arguments = [].concat(arguments);
                    startCache.thisArg = this;
                }
                return true;
            } else {
                console.log("karma is not on the page");
                return false;
            }
        }
        
        /** 
         * Start karma.  The main test module should invoke this.
         */
        export function startKarma() {
            if (startCache.lambda) {
                console.log("littleware starting karma");
                const win = window as any;
                let alreadyStarted = false;
                // restore the original (pre-patch below) start function
                win.__karma__.start = function() {
                    if (alreadyStarted) {
                        console.log('ERROR: littleware karma already started!');
                        return;
                    }
                    alreadyStarted = true;
                    startCache.lambda.apply(this, arguments);
                };

                if (startCache.thisArg) {
                    // karma has already tried to start, but we made it wait for us
                    win.__karma__.start.apply(startCache.thisArg, startCache.arguments);
                    startCache.thisArg = null;
                }
                // else - NOOP - wait for karma to start things up normally
            } else {
                console.log("karma is not on the page");
            }      
        }

        // monkey patch the karma start method, 
        // so karma doesn't start till testMain explicitly
        // invokes startKarma() - forcing karma
        // to wait for asynchronous modules to load
        const _isKarma = patchKarma(window as any);

        /** 
         * @return true if karma is on the page, and has
         *    been patched so that littleware.test.startKarma()
         *    will launch the karma test suite
         */
        export function isKarma() { return _isKarma; }
    }
}