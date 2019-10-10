# TL;DR

A little library of web components and utilities.

## Web Components

### lw-arrival-pie

A pie chart or clock view that presents the duration of events over a one hour period.

[src/@littleware/little-elements/lib/arrivalPie/README.md](./src/@littleware/little-elements/lib/arrivalPie/README.md)

### littleware style guide

CSS rules, icons, fonts, and colors underlying littleware web components.

[src/@littleware/little-elements/lib/styleGuide/README.md](./src/@littleware/little-elements/lib/styleGuide/README.md)

### little test utils

Utilities for testing little web components with jasmine and karmajs.

[src/@littleware/little-elements/lib/test/README.md](./src/@littleware/little-elements/lib/test/README.md)

## nodejs services

`little-elements` includes a set of helpers for building, developing, and testing server and web applications with nodejs, custom elements, and typescript.

* `gulpHelper` - a set of [gulp](https://github.com/gulpjs/gulp) rules that can be imported into similarly structured projects
* `testHelper` - helps integrate manual and automated tests
* `little-server` - web-server for static content

[./src/@littleware/little-elements/bin/README.md](./src/@littleware/little-elements/bin/README.md)


## Design, develop, test, document, deploy

### Source layout

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

### Deployment

The build process is setup so that commonjs and web modules are layed out for easy import into other npm packages.  The web content is setup to load code via relative paths when possible, but otherwise assumes javascript modules are deployed under a `/modules/` root.


### Dev-test

See the `./buildspec.yml` [codebuild](https://aws.amazon.com/codebuild/) configuration.

```
npm run build
npm test
npm run lint
npm audit
```

The `npm test` command runs a [jasmine](https://jasmine.github.io/index.html) test suites for web modules (using [karmajs](http://karma-runner.github.io/4.0/index.html)) and commonjs modules (with jasmine's nodejs runner).

### linting

The `lint` script integrates with `tslint`.  There is active development under way in the `typescript` and `eslint` community to integrate via the [typescript-eslint project](https://github.com/typescript-eslint/typescript-eslint), so we'll migrate to that when it's ready.

* https://medium.com/palantir/tslint-in-2019-1a144c2317a9
* https://eslint.org/blog/2019/01/future-typescript-eslint
