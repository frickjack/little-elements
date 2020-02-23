import { loadFromRule } from "../configHelper.js";

const configPath = `${__dirname}/testConfig.json`;

describe("the ConfigHelper", () => {
    it("loads config from json", async (done) => {
        try {
            const config = await loadFromRule(
                { testConfig: {
                    ttlSecs: 300,
                    type: "file",
                    value: configPath,
                    },
                }).get();
            // tslint:disable-next-line
            expect(config.testConfig.idpConfigUrl).toBe("https://accounts.google.com/.well-known/openid-configuration");
            done();
        } catch (err) {
            done.fail(err);
        }
    });

});
