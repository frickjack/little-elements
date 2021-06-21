/* eslint-disable */
/*
Most of this code is just a copy of
    node_modules/jasmine-core/lib/jasmine-core/boot.js
with this copyright:

Copyright (c) 2008-2019 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/*
 Starting with version 2.0, this file "boots" Jasmine, performing all of the necessary initialization before executing the loaded environment and all of a project's specs. This file should be loaded after `jasmine.js` and `jasmine_html.js`, but before any project source files or spec files are loaded. Thus this file can also be used to customize Jasmine for a project.
 If a project is using Jasmine via the standalone distribution, this file can be customized directly. If a project is using Jasmine via the [Ruby gem][jasmine-gem], this file can be copied into the support directory via `jasmine copy_boot_js`. Other environments (e.g., Python) will have different mechanisms.
 The location of `boot.js` can be specified and/or overridden in `jasmine.yml`.

 [jasmine-gem]: http://github.com/pivotal/jasmine-gem
 */

declare let jasmineRequire: any;

/**
 * Add missing types - TODO: fix @type/jasmine
 */
declare namespace jasmine {
  class Timer { constructor(); }

  class QueryString {
    constructor(opts: any);
    public getParam(key: string): any;
    public navigateWithNewParam(a: string, b: boolean): any;
    public fullStringWithNewParam(k: string, v: string): string;
  }

}

/**
 * This customization of the default jasmin boot.js exposes an 'startJasmine' function
 * by which the 'main' es2015 test module can begin execution of the suite
 * of tests that have asynchronously loaded onto the page.
 * The default 'boot' expects that every test spec has loaded synchronously
 * before it executes.
 */
namespace littleware {
  export namespace test {
    const win = window as any;
    /**
   * ## Require &amp; Instantiate
   *
   * Require Jasmine's core files. Specifically, this requires and attaches all of Jasmine's code to the `jasmine` reference.
   */
    window.jasmine = jasmineRequire.core(jasmineRequire);

    /**
   * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
   */
    jasmineRequire.html(jasmine);

    /**
   * Create the Jasmine environment. This is used to run all specs in a project.
   */
    const env = jasmine.getEnv();

    /**
   * ## The Global Interface
   *
   * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
   */
    const jasmineInterface = jasmineRequire.interface(jasmine, env);

    /**
   * Helper function for readability above.
   */
    function extend(destination, source) {
      for (const property in source) { destination[property] = source[property]; }
      return destination;
    }

    /**
   * Add all of the Jasmine global/public interface to the global scope, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
   */
    extend(window, jasmineInterface);

    /**
   * ## Runner Parameters
   *
   * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
   */

    const queryString = new jasmine.QueryString({
      getWindowLocation() { return window.location; },
    });

    const filterSpecs = !!queryString.getParam('spec');

    const config = {
      failFast: queryString.getParam('failFast'),
      oneFailurePerSpec: queryString.getParam('oneFailurePerSpec'),
      hideDisabled: queryString.getParam('hideDisabled'),
      random: null,
      seed: null,
      specFilter: null,
    };

    const random = queryString.getParam('random');

    if (random !== undefined && random !== '') {
      config.random = random;
    }

    const seed = queryString.getParam('seed');
    if (seed) {
      config.seed = seed;
    }

    /**
   * ## Reporters
   * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
   */
    const htmlReporter = new (jasmine.HtmlReporter as any)({
      env,
      navigateWithNewParam(key, value) { return queryString.navigateWithNewParam(key, value); },
      addToExistingQueryString(key, value) { return queryString.fullStringWithNewParam(key, value); },
      getContainer() { return document.body; },
      createElement() { return document.createElement.apply(document, arguments); },
      createTextNode() { return document.createTextNode.apply(document, arguments); },
      timer: new jasmine.Timer(),
      filterSpecs,
    });

    /**
   * The `jsApiReporter` also receives spec results,
   * and is used by any environment that needs to
   * extract the resultsfrom JavaScript.
   */
    env.addReporter(jasmineInterface.jsApiReporter);
    env.addReporter(htmlReporter as jasmine.CustomReporter);

    /**
   * Filter which specs will be run by matching the start
   * of the full name against the `spec` query param.
   */
    const specFilter = new (jasmine.HtmlSpecFilter as any)({
      filterString() { return queryString.getParam('spec'); },
    });

    config.specFilter = function (spec) {
      return specFilter.matches(spec.getFullName());
    };

    (env as any).configure(config);

    /**
   * Setting up timing functions to be able to be overridden.
   * Certain browsers (Safari, IE 8, phantomjs) require this hack.
   */
    window.setTimeout = window.setTimeout;
    window.setInterval = window.setInterval;
    window.clearTimeout = window.clearTimeout;
    window.clearInterval = window.clearInterval;

    export function startJasmine() {
      htmlReporter.initialize();
      env.execute();
    }

  }
}
