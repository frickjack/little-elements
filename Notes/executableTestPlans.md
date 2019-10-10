# TL;DR

* We want test plans and acceptance tests to help guide feature development.
* We want to track test plans as artifacts in git
* We want to use [Gherkin](https://cucumber.io/docs/gherkin/reference/) or some similar "living documentation" technology
that allows us to link test automation with human readable test plans

[jasminejs](https://jasmine.github.io) and other test automation frameworks can support manual tests via `interactive` helpers.

## Overview

### QA Process

## Living Test Plan

A test plan is a living document that documents how a system should fulfill different use cases and how the system behaves under various scenarios.  The system or feature design process should produce an initial test plan which guides the work of developers and testers, and helps ensure that the development process yields a system that matches its requirements.  The test plan changes as the requirements for a system change.

Unit tests and integration tests are both important parts of the quality assurance process.
During system development the developer team produce unit tests that run as part of the system's [continuous integration](https://en.wikipedia.org/wiki/Continuous_integration) process.

The QA team deploys each new build of the feature to a test environment, and caries out a *test cycle* that tests the behavior of the system against the system's test plan, and generates a report.
The level of automation applied to a test cycle generally increases as a feature evolves.  A [CICD](https://en.wikipedia.org/wiki/CI/CD) system can run a fully automated test cycle that deploys each new build to a test environment, runs the test plan, and publish a report without human intervention.

### Test Automation

A test plan should naturally evolve from manual checks carried out by the QA team to a fully automated test suite execute by a CICD pipeline. 
Test frameworks like [Jasminejs](https://jasmine.github.io) support automated tests, and can be leveraged to execute and generate reports for manual test cycles.

The [testHelper.ts](../src/@littleware/little-elements/bin/testHelper.ts) helpers allow us to write jasminejs test suites that present instructions to a human tester, then interactively collect the results of the test.  This facility allows us to intermix manual and automated tests, and also support partially automated tests.

For example, one test in the [testHelperSpec](../src/@littleware/little-elements/bin/spec/testHelperSpec.ts) looks like this:

```
    it("allows interactive tests", ... ifInteractive(async () => {
        let result = await interactive("press enter at the prompt");
        expect(result.didPass).toBe(true);
        result = await interactive("enter \"y\" at the prompt");
        expect(result.didPass).toBe(true);
        result = await interactive("enter \"n\" at the prompt, then some explanation at the next prompt");
        expect(result.didPass).toBe(false);
        expect(result.details.length > 0).toBe(true);
    }, 3600000) as any,
    );
```

What's going on here?
* `ifInteractive` tests the `LITTLE_INTERACTIVE` environment variable.  If it's not `false`, then `ifInteractive` just returns its arguments (a lambda and timeout for jasmine's `it` method); otherwise `ifInteractive` returns a do-nothing test lambda that passes for non-interactive environments
* `interactive` prints the given instructions to the console for a human tester, and prompts the tester for whether the test passed or failed
* there's also an `isInteractive` helper that just returns `true` if the `LITTLE_INTERACTIVE` environment variable is not `false`, and allows an automated test case to include optional manual elements

That's it!
