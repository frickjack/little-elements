import { sleep } from "../../mutexHelper.js";
import "../appContext.js";

interface Tools {
    i18n: any;
    log: any;
}

describe( "the application context", () => {
    let tools:Tools = null;

    beforeAll((done) => {

    });

    it( "Can dance", () => {
        expect(true).toBe(true);
    });


});
