import { sleep } from "../../../common/mutexHelper.js";
import { getStage } from "../../test/util.js";
import "../authUi.js";
import { LittleAuthUI } from "../authUi.js";

describe( "the lw-auth-ui custom element", () => {
    it( "Can dance", () => {
        expect(true).toBe(true);
    });

    it( "Can render an lw-auth-ui", (done) => {
        const stage = getStage( "authmgr1", "LittleAuthUI" );
        const elem = document.createElement( "lw-auth-ui" ) as LittleAuthUI;
        // little hack to disconnect from state bus
        (elem as any).listener = () => {}
        elem.user = "frickjack";
        // 6 degrees === 1 minute
        stage.appendChild(elem);
        
        // Give browser chance to render
        sleep(20).then(
            () => {
                expect(stage.querySelectorAll("lw-auth-ui").length).toBe(1);
                done();
            },
        );
    });
});
