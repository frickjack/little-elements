# TL;DR

Some basic information on our tagged releases.
Note - `git log tag1...tag2` shows the commit log between versions.

## 1.2.0

* move to `@fortawesome/fontawesome-free` npm package
* move `lw-header-simple` custom element from `little-apps`
* add hamburger support to `lw-drop-down`
* setup custom elements as app-context providers and consumers to avoid race conditions using element properties in lit-html templates
* transition to [eslint](https://eslint.org/) and [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)

## 1.1.3

* CICD codebuild region handling
* styleGuide shell GA CSP whitelist
* fix authUi bug with null hashTag

## 1.1.2

* print media CSS rule
* little-nodedev version
* tweak shell layout
* CICD codebuild to nodejs 14

## 1.1.1

* introduce CSS loading spinner

## 1.1.0

* introduce `appContext`: i18n, sharedState, eventBus, configuration
* introduce `authMgr` authentication UX
