import { interactive, ifInteractive } from "../testHelper.js";

describe("the testHelper", () => {
    it("allows interactive tests", ... ifInteractive(async () => {
        let result = await interactive("press enter at the prompt");
        expect(result.didPass).toBe(true);
        result = await interactive("enter \"y\" at the prompt");
        expect(result.didPass).toBe(true);
        result = await interactive("enter \"n\" at the prompt, then some explanation at the next prompt");
        expect(result.didPass).toBe(false);
        expect(result.details.length > 0).toBe(true);
    }, 3600000,) as any,
    );

    it("detects if a test is interactive by testing an environment variable", function() {
        const originalValue = process.env["LITTLE_INTERACTIVE"];
        const lambdaTest = () => {}
        process.env["LITTLE_INTERACTIVE"] = "true";
        const isInteractive = ifInteractive(lambdaTest, 10000);
        process.env["LITTLE_INTERACTIVE"] = "false";
        const isNotInteractive = ifInteractive(lambdaTest, 10000);
        process.env["LITTLE_INTERACTIVE"] = originalValue;
        expect(isInteractive[0] === lambdaTest && isInteractive[1] === 10000).toBe(true);
        expect(isNotInteractive[0] !== lambdaTest && isNotInteractive[1] === undefined).toBe(true);
    });
});
