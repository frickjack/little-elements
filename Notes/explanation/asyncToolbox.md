# TL;DR

A javascript application designer must structure her app to asynchronously load configuration and 
bootstrap its modules at startup.  The asynchronous toolbox pattern addresses this challenge
with a simple dependency injection framework.

## The Asynchronous Bootstrap Problem

Consider an application with three modules in addition to modMain: modA, modB, and modC that export classA, classB, and classC respectively where modC imports (depends on) modA and modB, and classC is a singleton, and each module asynchronously loads configuration at startup.  How should a developer structure the code in each module?

If each module's startup (configuration load) were synchronous, then the application could be structured like this.

```
// modC

import classA from "modA";
import classB from "modB";

function loadConfig() { ... }

class C {
    a;
    b;
    config;

    constructor(a, b, config) {
        this.a = a;
        this.b = b;
        this.config = config;
    }
    ...

    static get providerName() {
        return "driver/myApp/modA/classA";
    }
}

let lazySingleton = null;

export getC() {
    if (! lazySingleton) {
        lazySingleton = new C(new A(), new B(), loadConfig());
    }
    return lazySingleton;
}
```
```
// modB

function loadConfig() {}

const sharedConfig = loadConfig();

export class B {}
```
```
// modA

function loadConfig() {}

const sharedConfig = loadConfig();

export class A {}
```
```
// modMain
import getC from "modC";

function go() {
    const c = getC();
    ...
}

go();
```

If the `mod*.loadConfig` functions are asynchronous, then bootstrapping this simple application becomes more complicated as the asynchrony propogates through the call graph to the class constructors. This simple implementation also has a few other shortcomings that can become troublesome in a larger application.

* First, the various `loadConfig` functions can be factored out to a single configuration module, modConfig, that supports default and override configurations and loading configuration from external data sources.
* Second, in some cases it is useful to decouple an interface from its implementation, so that different applications or application deployments can use an implementation that fits its environment.  Dependency injections frameworks like [guice](https://github.com/google/guice) and [Spring](https://spring.io) are one way to decouple interface from implementation in java applications.
* Finally, an application that composes multiple modules that load external configuration and connect to external systems may benefit from a framework that manages the application lifecycle - or at least startup and shutdown.

## Asynchronous Toolbox

The [little-elements](https://github.com/frickjack/little-elements) package includs an appContext module that provides an "asynchronous toolbox" framework for managing application configuration and bootstrap and decoupling interfaces from implementation.

Each module participating in the asynchronous toolbox provides zero or more asynchronous tool factories, and consumes a toolbox of zero or more tool factories from other modules.  For example, modA in the example above (with typescript types) would look something like this.

```
// modA

import { Logging } from "../../@littleware/little-elements/common/logging.js";
import AppContext, { getTools, ConfigEntry } from "../../@littleware/little-elements/common/appContext.js";
import { SharedState } from "../../@littleware/little-elements/common/sharedState.js";
import { LazyProvider } from "../../@littleware/little-elements/common/provider.js";

/**
 * The configuration that classA consumes
 */
interface Config {
   foo: string;
   endpoint: string;
}

export const configKey = "config/myApp/modA";


/**
 * The tools that classA consumes - including config
 */
interface Tools {
    config: Config;
    log: Logger;
    state: SharedState;
}

class A {
    tools: Tools;

    constructor(tools:Tools) {
        this.tools = tools;
    }
    ...
}

AppContext.get().then(
    (cx) => {
        // register a default config. 
        // other modules can provide overrides.
        // the runtime also loads overrides from
        // registered configuration sources 
        // like remote or local json files
        cx.putDefaultConfig(configKey, { foo: "foo", endpont: "endpont" });

        // register a new provider
        cx.putProvider(
            classC.providerName,
            {
                config: configKey,
                log: Logger.providerName,
                state: StateManager.providerName,
            },
            async (toolBox) => {
                // the injected toolBox is full of asynchronous 
                // factories: async get():Tool
                // the `getTools()` helper below invokes get()
                // on every factory in the toolbox
                const tools: Tools = await getTools(toolBox);
                // the configuration factory
                // returns a ConfigEntry that includes 
                // both the defaults and overrides
                tools.config = { ...tools.config.defaults, ...tools.config.overrides };
                return LazyProvider(() => new C(tools as Tools));
            }
        );
    }
);

// Also export an asynchronous provider
// that modules not participating in the
// app context can use
export async function getC(): Promise<C> {
    return AppContext.get().then(
        (cx) => cx.getProvider(C.providerName),
    ).then(
        (provider: Provider<C>) => provider.get(),
    );
}


```

Then the main module for the application does something like this.

```
// mainMod

class Tools {
    c: classC;
}

function go(tools:Tools) { ... }

appContext.get().then(
    cx => cx.onStart( 
        // register a callback to run once the app
        // main module triggers start
        { c: classC.providerName },
        (tools:Tools) => go(tools),
).then(
    cx => cx.start();  // start the app
);

```

## Example

The little-elements package leverages the asynchronous toolbox pattern in
its [authentication UX](https://github.com/frickjack/little-elements/tree/master/src/%40littleware/little-elements/lib/authMgr) (signin, signout).
The authn system relies
on interactions between several modules.

The `lw-auth-ui` custom element builds on a `lw-drop-down` custom
element to populate a drop-down menu with items that trigger internal
navigation events.  The drop-down component loads its menu contents
(keys and navigation targets) as configuration from its asynchronous toolbox.
The toolbox also contains helpers for internationalization and shared state.
The UI listens for changes to the "logged in user" key in the shared state store.

The `lw-auth-controller` custom element consumes a toolbox that includes
configuration, `historyHelper`, and `sharedState` tools.  The controller listens
for the internal navigation events triggered by the UI, 
then redirects the user's browser to the appropriate OIDC endpoint.
The controller also polls the backend user-info endpoint to maintain
the user data in the shared state store that the UI consumes.

## Summary 

The asynchronous toolbox is a flexible approach to 
manage asynchronous application bootstrap and configuration.
It is adaptable to 
different situations like injecting dependencies into HTML custom elements.
Unfortunately this pattern introduces boiler plate into the codebase.
We hope to streamline the framework as it evolves over time.
