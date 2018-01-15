import { getStage } from '../util.js';

describe( "littleware.test.util", function() {
    it( "provides DOM stages for tests", function() {
        let section = getStage( "utilSpec", "Just a test" );
        expect( section ).toBeDefined();
        expect( section.tagName ).toBe( "SECTION" );
        expect( section.getAttribute( "id" ) ).toBe( "utilSpec" );
        let section2 = getStage( "utilSpec" );
        expect( section2 ).toBe( section );
    })
} );
