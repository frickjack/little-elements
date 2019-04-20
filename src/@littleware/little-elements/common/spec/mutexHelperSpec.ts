import { sleep, squish, LazyThing } from '../mutexHelper.js';


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
    it("can squish a lambda to avoid overlapping calls", function(done){
        const lambda = squish(() => sleep(1000));
        const s1 = lambda();
        const s2 = lambda();
        expect(s1).toBe(s2);
        s2.then(() => {
            const s3 = lambda();
            expect(s3).not.toBe(s2);
            done();
        });
    });
    it("can lazy load a thing", function(done) {
        const lazy = new LazyThing(() => Promise.resolve("frickjack"));
        const thing1 = lazy.getThing();
        const thing2 = lazy.getThing();
        expect(thing1).toBe(thing2);
        Promise.all([thing1, thing2]).then(
            (v:[string, string]) => {
                expect(v.length).toBe(2);
                expect(v[0]).toBe(v[1]);
                done();
            }
        );
    });
});
