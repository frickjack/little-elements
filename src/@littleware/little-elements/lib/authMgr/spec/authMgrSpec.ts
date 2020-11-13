import { sleep } from "../../../common/mutexHelper.js";
import { getStage } from "../../test/util.js";
import "../authMgr.js";
import { LittleAuthMgr } from "../authMgr.js";

describe( "the lw-auth-mgr custom element", () => {
    it( "Can dance", () => {
        expect(true).toBe(true);
    });

    it( "Can render an lw-auth-mgr", (done) => {
        const stage = getStage( "authmgr1", "LittleAuthMgr" );
        const elem = document.createElement( "lw-auth-mgr" ) as LittleAuthMgr;
        elem.user = "frickjack";
        // 6 degrees === 1 minute
        stage.appendChild( elem );
        // Give browser chance to render
        sleep(1).then(
            () => {
                expect(stage.querySelectorAll("lw-auth-mgr").length).toBe(1);
                done();
            },
        );
    });
});
