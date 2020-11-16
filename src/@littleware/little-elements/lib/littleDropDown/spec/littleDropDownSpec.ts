import AppContext from '../../../common/appContext/appContext.js';
import { sleep } from "../../../common/mutexHelper.js";
import { getStage } from "../../test/util.js";
import "../littleDropDown.js";

const testContext = 'littleware/lib/littleDropDown/spec'


describe( "the lw-drop-down custom element", () => {
    it( "Can dance", () => {
        expect(true).toBe(true);
    });

    it( "Can render a lw-drop-down", (done) => {
        const stage = getStage("dropdown1", "LittlelittleDropDown");
        const elem = document.createElement("lw-drop-down");
        elem.setAttribute('context', testContext);
        stage.appendChild(elem);
        sleep(1).then(
            () => {
                expect(stage.querySelectorAll("lw-drop-down").length).toBe(1);
                done();
            },
        );
    });
});

AppContext.get().then(
    (cx) => {
        cx.putDefaultConfig(testContext, {
            root: {
                labelKey: 'test-drop-down',
                className: 'lw-dd-test',
                href: '#whatever',
            },
            items: [
                {
                    labelKey: 'test-label1',
                    className: 'lw-dd-test__label1',
                    href: '#lw-dd-test/whatever1',
                },
                {
                    labelKey: 'test-label2',
                    className: 'lw-dd-test__label2',
                    href: '#lw-dd-test/whatever2',
                },
            ]
        });       
    }
);
