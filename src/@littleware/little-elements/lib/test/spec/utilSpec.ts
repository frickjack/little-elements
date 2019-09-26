import { getStage } from "../util.js";

describe( "littleware.test.util", () => {
    it( "provides DOM stages for tests", (done) => {
        const section = getStage( "utilSpec", "Just a test" );
        expect( section ).toBeDefined();
        expect( section.tagName ).toBe( "SECTION" );
        expect( section.getAttribute( "id" ) ).toBe( "utilSpec" );
        // Give the browser a change to render
        setTimeout(
            () => {
                const section2 = getStage( "utilSpec" );
                expect( section2 ).toBe( section );
                done();
            }, 20,
        );
    });
} );
