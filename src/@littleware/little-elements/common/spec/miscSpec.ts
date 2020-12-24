import { range, relativeUrl } from "../misc.js";

describe("the misc utils module", () => {
    it("can construct a range", () => {
        expect(range(0, 10).length).toBe(10);
        expect(range(0, -10, -2).length).toBe(5);
    });

    it("can construct a relative URL", () => {
        expect(relativeUrl(new URL("https://whatever.whatever/abc/def/gef"), "../"),
            ).toBe("https://whatever.whatever/abc/def");
        expect(relativeUrl(new URL("https://whatever.whatever/abc/def/gef"), "."),
            ).toBe("https://whatever.whatever/abc/def/gef");
        expect(relativeUrl(new URL("https://whatever.whatever/abc/def/gef"), "../hij"),
            ).toBe("https://whatever.whatever/abc/def/hij");
    });
});
