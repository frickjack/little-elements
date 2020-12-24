import express = require("express");
import fetch = require("node-fetch");

import * as helloHelper from "../helloHandler.js";

describe("hello express handler", () => {
    const app = express();
    let server = null;

    beforeAll((done) => {
        helloHelper.expressRouter().then(
            (router) => {
                app.use("/", router);
                server = app.listen(3333, () => {
                    // tslint:disable-next-line
                    console.log("helloHandlerSpec listening at http://localhost:3333/");
                });
                done();
            },
        );
    });

    afterAll((done) => {
        if (server) {
            server.close(() => { done(); });
            server = null;
        }
    });

    it("responds to hello requests", (done) => {
        fetch("http://localhost:3333/hello").then(
            (r) => r.json(),
        ).then(
            (info) => {
                expect(info.message).toBe("hello there!");
                done();
            },
        ).catch(done.fail);
    });

});
