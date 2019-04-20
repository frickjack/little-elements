import { sleep } from '../mutexHelper.js';


describe( "the littleware.mutexHelper", function() {
    it("can sleep for a few seconds", function(done) {
        const startMs = Date.now();
        sleep(3000).then(
            () => {
                const endMs = Date.now();
                expect(endMs - startMs).toBeGreaterThan(2900);
                done();        
            }
        );
    });

});
