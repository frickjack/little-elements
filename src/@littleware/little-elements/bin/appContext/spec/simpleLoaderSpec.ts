import { fetch } from "../simpleLoader.js";

const configPath = `${__dirname}/testConfig.json`;

describe("the simpleLoader", () => {
    it("loads config from json file", async (done) => {
        try {
            const configStr = await fetch(configPath);
            const config = JSON.parse(configStr);
            expect(config.idpConfigUrl).toBe("https://accounts.google.com/.well-known/openid-configuration");
            done();
        } catch (err) {
            done.fail(err);
        }
    });

});
