import { getLogger } from "../bunyanLogger.js";

describe("the bunyan logger", () => {
    let logger = null;

    beforeAll(async (done) => {
        logger = await getLogger();
        done();
    });

    it("writes logs", () => {
        expect(!! logger).toBe(true, "logger is defined");
        logger.info("info level log");
        logger.warn("a warning!");
        logger.error("an error!");
        logger.debug("some debugging");
        logger.trace("some tracing");
    });
});
