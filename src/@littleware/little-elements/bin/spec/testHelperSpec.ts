import { ifInteractive, interactive, isInteractive } from "../testHelper.js";

describe("the testHelper", () => {
    it("allows interactive tests", ... ifInteractive(async () => {
        let result = await interactive("press enter at the prompt");
        expect(result.didPass).toBe(true);
        result = await interactive("enter \"y\" at the prompt");
        expect(result.didPass).toBe(true);
        result = await interactive("enter \"n\" at the prompt, then some explanation at the next prompt");
        expect(result.didPass).toBe(false);
        expect(result.details.length > 0).toBe(true);
    }, 3600000) as any,
    );

    it("detects if a test is interactive by testing an environment variable", () => {
        const originalValue = process.env.LITTLE_INTERACTIVE;
        const lambdaTest = () => "noop";
        process.env.LITTLE_INTERACTIVE = "true";
        expect(isInteractive()).toBe(true);
        const yesInteractive = ifInteractive(lambdaTest, 10000);
        process.env.LITTLE_INTERACTIVE = "false";
        expect(isInteractive()).toBe(false);
        const notInteractive = ifInteractive(lambdaTest, 10000);
        process.env.LITTLE_INTERACTIVE = originalValue;
        expect(yesInteractive[0] === lambdaTest && yesInteractive[1] === 10000).toBe(true);
        expect(notInteractive[0] !== lambdaTest && notInteractive[1] === undefined).toBe(true);
    });
});
