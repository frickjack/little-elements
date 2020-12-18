import { getSharedState } from "../../../common/appContext/sharedState.js";
import { sleep } from "../../../common/mutexHelper.js";
import { getStage } from "../../test/util.js";
import { LittleAuthController } from "../authControl.js";
import "../authControl.js";
import { LittleAuthUI, newUserInfo, stateKey } from "../authUi.js";

describe("the lw-auth-control custom element", () => {
    it("Can dance", () => {
        expect(true).toBe(true);
    });

    it("Can render an lw-auth-control", async (done) => {
        const stage = getStage( "authcontrol1", "LittleAuthController" );
        // TODO - mock out the fetch api that the controller uses
        const control = document.createElement( "lw-auth-control" ) as LittleAuthController;
        const ui = document.createElement( "lw-auth-ui" ) as LittleAuthUI;
        // 6 degrees === 1 minute
        stage.appendChild(control);
        stage.appendChild(ui);
        // Give browser chance to render
        await sleep(1000);
        expect(stage.querySelectorAll("lw-auth-control").length).toBe(1);
        expect(stage.querySelectorAll("lw-auth-ui").length).toBe(1);
        const state = await getSharedState();
        const testUser = "testUser";
        await state.changeState(stateKey, () => newUserInfo(testUser));
        await sleep(100); // wait for state to propogate
        expect(ui.user).toBe(testUser);
        done();
    });
});
