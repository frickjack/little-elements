import { aliasName as loggerAlias, Logger } from "../../../common/appContext/logging.js";
import { Ii18n, providerName as i18nProvider } from "../../appContext/i18n.js";
import AppContext, { getTools } from "../appContext.js";

interface Tools {
    i18n: Ii18n;
    log: Logger;
}

const toolKeys = {
    i18n: i18nProvider,
    log: loggerAlias,
};

describe("the lw-app-context custom element", () => {
    it("can provide tools onStart", (done) => {
        AppContext.get().then(
            (cx) => cx.onStart(toolKeys, (toolBox) => getTools(toolBox)),
        ).then(
            (boxOfTools) => {
                expect(!!boxOfTools).toBe(true, "app context delivers tools");
                done();
            },
        );
    });
});
