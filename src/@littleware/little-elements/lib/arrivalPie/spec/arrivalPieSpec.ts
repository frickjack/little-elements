import ArrivalPie, { arrivalListToString, buildPath, stringToArrivalList } from '../arrivalPie.js';
import { getStage } from "../../test/util.js"; 
import { sleep } from '../../../common/mutexHelper.js';

describe( "the littleware.arrivalPie custom element", function() {
    it( "Can convert between an arrival-list and an attribute string", function() {
        let arrList = [ { startAngle: 10, durationDegrees:20 }, { startAngle: 40, durationDegrees: 50 } ],
        arrStr = arrivalListToString( arrList );
        expect( arrStr ).toBe( arrivalListToString( stringToArrivalList( arrStr ) ) ); 
    });

    it ( "Has a static observedAttributes property", function() {
        let propList = ArrivalPie.observedAttributes;
        expect( propList.length ).toBe( 1 );
        expect( propList[0] ).toBe( "arrival-list" );
    });

    it( "Can allocate an ArrivalPie object", function(){
        let pie = new ArrivalPie();
        expect( pie ).toBeDefined();
    });

    it ( "Listens for attribute change events on 'arrival-list' attribute", function(done) {
        let pie = new ArrivalPie();
        let stage = getStage( "changeCallback", "Testing attributeChangedCallback" );
        stage.appendChild( pie );
        spyOn( pie, "_render" ).and.callThrough();
        pie.setAttribute( "arrival-list", "30,30;" );
        sleep(20).then( // give browser chance to render
            function() {
                expect( (pie._render as any) ).toHaveBeenCalled();
                done();
            }
        );
    });

    it ( "Can build a path from an arrival", function() {
        let arr = { startAngle: 10, durationDegrees: 30 };
        let path = buildPath( arr );

        expect( path.getAttribute("d").indexOf( "M50,50 L50,5 A45,45 0 0,1" ) ).toBe( 0 );
    });

    it( "Can render an ArrivalPie with a couple arrivals", function(done) {
        let stage = getStage( "pie1", "ArrivalPie - 2 arrivals" );
        let pie = document.createElement( "lw-arrival-pie" );
        // 6 degrees === 1 minute
        stage.appendChild( pie );
        pie.setAttribute( "arrival-list", "20,6;50,6");
        // Give browser chance to render
        sleep(20).then(
            function() {
                expect( pie.querySelectorAll( "path" ).length ).toBe( 2 );
                done();
            }
        );
    });
});
