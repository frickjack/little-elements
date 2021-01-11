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


## Documentation TOC

See [this bLog](https://www.divio.com/blog/documentation/) for an introduction to the different types of documentation (explanation, how-to, tutorial, reference).

### Explanation

* the [gulp helper](./Notes/explanation/gulpHelper.md) includes a variety of rules to help build and deploy server and client side typescript apps.
* the [little server](./Notes/explanation/littleServerAndLambda.md) provides a simple [expressjs](https://expressjs.com) server for locally serving web apps to clients and running server side express routers
* [executable test plans](./Notes/explanation/executableTestPlans.md) provide a framework for specifying, running, reporting from, and automating test plans that begin as instructions to for manual testing

### How-to

* [dev-test](Notes/howto/devTest.md)

### Tutorials

### Reference

* [release notes](Notes/reference/releaseNotes.md)

