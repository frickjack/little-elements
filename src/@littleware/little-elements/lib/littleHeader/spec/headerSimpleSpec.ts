import {getStage} from "../../../../../../@littleware/little-elements/web/lib/test/util.js";
import {SimpleHeader} from "../headerSimple.js";

describe( "the lw-header-simple custom element", () => {
    it ("Has a static observedAttributes property", () => {
        const propList = SimpleHeader.observedAttributes;
        expect(propList.length).toBe( 1 );
        expect(propList[0]).toBe( "title" );
    });

    it("Can allocate a SimpleHeader object", () => {
        const hd = new SimpleHeader();
        expect(hd).toBeDefined();
    });

    it ("Listens for attribute change events on 'title' attribute", () => {
        const hd = new SimpleHeader();
        const stage = getStage("changeCallback", "Testing attributeChangedCallback");
        stage.appendChild(hd);
        spyOn(hd, "_render").and.callThrough();
        hd.setAttribute("title", "TestTitle");
        expect((hd._render as any).calls.any()).toBe(true);
        expect(hd.querySelector(".lw-header__title").textContent.trim()).toBe("TestTitle");
    });

    it("Can render a SimpleHeader", () => {
        const stage = getStage("header1", "SimpleHeader - 'Test Title'");
        const hd = document.createElement("lw-header-simple");
        stage.appendChild(hd);
        hd.setAttribute("title", "Test Title");
        expect( stage.querySelector(".lw-header__title").textContent.trim()).toBe("Test Title");
    });
});
