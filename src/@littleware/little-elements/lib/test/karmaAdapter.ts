namespace littleware {
    export namespace test {
        var startCache:Function = null;

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
                startCache = win.__karma__.start as Function;
                win.__karma__.start = function() {
                    console.log("Ignoring initial __karma__.start");
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
            if (startCache) {
                console.log("littleware starting karma");
                const win = window as any;
                win.__karma__.start = startCache;
                win.__karma__.start();
            } else {
                console.log("karma is not on the page");
            }      
        }

        const _isKarma = patchKarma(window as any);

        /** 
         * @return true if karma is on the page, and has
         *    been patched so that littleware.test.startKarma()
         *    will launch the karma test suite
         */
        export function isKarma() { return _isKarma; }
    }
}