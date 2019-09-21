# TL;DR

A little library of web components and utilities.

## Web Components

### lw-arrival-pie

A pie chart or clock view that presents the duration of events over a one hour period.

[src/arrivalPie/README.md](./src/arrivalPie/README.md)

### littleware style guide

CSS rules, icons, fonts, and colors underlying littleware web components.

[src/styleGuide/README.md](./src/styleGuide/README.md)

### little test utils

Utilities for testing little web components with jasmine.

[src/test/README.md](./src/test/README.md)

## nodejs services

### gulpHelper

A base set of gulp tasks suitable for importing into similarly structured typescript projects.  The `gulpHelper` includes rules for compiling `nunjucks` templates, compiling typescript code to both `commonjs` and `es2015` modules, and staging web content for deployment as a static website.

#### Source layout

```
src/@module-group/module/
    bin
    common
    lib
    site
    web
```

* `bin` - compiled into `./commonjs/bin` folder as `commonjs` modules suitable for nodejs applications and lambdas
* `common` - compiled into the `./commonjs/common/` folder as commonjs modules, and also `./web/common/` as es2015 modules
* `lib` - compiled into `./web/lib/`
* `site` - html, nunjucks templates, and other web content compiled into `./site`

#### Deployment

The build process is setup so that commonjs and web modules are layed out for easy import into other npm packages.  The web content is setup to load code via relative paths when possible, but otherwise assumes javascript modules are deployed under a `/modules/` root.

### little-server

The `little-server` binary is a simple express webapp that serves static content.  It automatically maps `./node_modules` to `/modules/`, and accepts other mappings on the command line.  For example - the `npm start` script launches the following command for local development (see [package.json](./package.json)):

```
node commonjs/bin/little-server.js /modules/@littleware/little-elements/web/ ./web/
```

## Dev-test

See the `./buildspec.yml` [codebuild](https://aws.amazon.com/codebuild/) configuration.

```
npm run build
npm test
npm audit
```

The `npm test` command runs a [jasmine](https://jasmine.github.io/index.html) test suites for web modules (using [karmajs](http://karma-runner.github.io/4.0/index.html)) and commonjs modules (with jasmine's nodejs runner).

