# TL;DR

Dev-test helpers for `nodejs`.

### Overview

### gulpHelper

A base set of gulp tasks suitable for importing into similarly structured typescript projects.  The `gulpHelper` includes rules for compiling `nunjucks` templates, compiling typescript code to both `commonjs` and `es2015` modules, and staging web content for deployment as a static website.

### testHelper

Helpers for integrating manual and automated tests.

The `@littleware/little-elements/bin/testHelper` module provides a small set of functions that fascilitate writing `jasminejs` test suites that require the test runner to interactively execute the test actions.  

The goal is to allow a manual test to evolve to an automated in a natural way.  This approach also allows manual and automated tests to use the same tools for executing test cycles and producing reports.

For example:

```
describe("the TODO app", () => {
    it("creates new TODO's", ... ifInteractive(() =>    {
            interactive("Login to the web site");
            interactive("Open the 'New TODO' tool, verify it renders correctly");
        }, 3600000)
    );
    ...
});
```

### little-server

The `little-server` implements a simple web server for static content.  It automatically maps `./node_modules` to `/modules/`, and accepts other mappings on the command line.  For example - the `npm start` script launches the following command for local development (see [package.json](./package.json)):

```
node commonjs/bin/little-server.js /modules/@littleware/little-elements/web/ ./web/
```

