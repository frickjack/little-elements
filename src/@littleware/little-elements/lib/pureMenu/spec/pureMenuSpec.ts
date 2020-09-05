import { sleep } from "../../../common/mutexHelper.js";
import { getStage } from "../../test/util.js";
import "../pureMenu.js";

describe( "the lw-pure-menu custom element", () => {
    it( "Can dance", () => {
        expect(true).toBe(true);
    });


    it( "Can render a lw-pure-menu", (done) => {
        const stage = getStage( "puremenu1", "LittlePureMenu" );
        const elem = document.createElement( "lw-pure-menu" );
        stage.appendChild( elem );
        sleep(1).then(
            () => {
                expect( stage.querySelectorAll( "lw-pure-menu" ).length ).toBe( 1 );
                done();
            },
        );
    });
});
