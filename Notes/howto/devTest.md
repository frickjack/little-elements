# TL;DR

Howto design, develop, test, document, deploy

## Source layout

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

## Deployment

The build process is setup so that commonjs and web modules are layed out for easy import into other npm packages.  The web content is setup to load code via relative paths when possible, but otherwise assumes javascript modules are deployed under a `/modules/` root.


## Dev-test

See the `./buildspec.yml` [codebuild](https://aws.amazon.com/codebuild/) configuration.

```
npm run build
npm test
npm run lint
npm audit
```

The `npm test` command runs a [jasmine](https://jasmine.github.io/index.html) test suites for web modules (using [karmajs](http://karma-runner.github.io/4.0/index.html)) and commonjs modules (with jasmine's nodejs runner).

## Linting

The `lint` script integrates with `tslint`.  There is active development under way in the `typescript` and `eslint` community to integrate via the [typescript-eslint project](https://github.com/typescript-eslint/typescript-eslint), so we'll migrate to that when it's ready.

* https://medium.com/palantir/tslint-in-2019-1a144c2317a9
* https://eslint.org/blog/2019/01/future-typescript-eslint

## Dependency Audit


## CICD
