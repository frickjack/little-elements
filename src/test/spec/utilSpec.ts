/// <reference path="../util.ts" />
namespace littleware {
    namespace test {        
        import test = littleware.test;

        describe( "littleware.test.util", function() {
            it( "provides DOM stages for tests", function() {
                let section = test.getStage( "utilSpec", "Just a test" );
                expect( section ).toBeDefined();
                expect( section.tagName ).toBe( "SECTION" );
                expect( section.getAttribute( "id" ) ).toBe( "utilSpec" );
                let section2 = test.getStage( "utilSpec" );
                expect( section2 ).toBe( section );
            })
        } );
    }
}