import { getLogger } from "../consoleLogger.js";

describe("the console logger", function() {
    let logger = null;
    
    beforeAll(async (done) => {
        logger = await getLogger();
        done();
    });

    it("writes logs", function() {
        logger.info("info level log");
        logger.warn("a warning!");
        logger.error("an error!");
        logger.debug("some debugging");
        logger.trace("some tracing");
    })
});
