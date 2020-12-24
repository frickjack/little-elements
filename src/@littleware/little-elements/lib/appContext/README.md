# TL;DR

An application context implements a simple dependency injection container to help structure an application and reduce duplication of effort, so UX designers can think less about plumbing.

* navigation/history management
* render and layer management - avoid multiple renders on multiple property changes
* internationalization
* configuration management
* popups, toasters, loading
* session management - CSRF, heartbeat, backoff and retry, request batching
* misc utils - debounce
* analytics - GA
* A-B testing
* user preferences

[Test case](./index.html)

## Application Context

At load time a module retrieves the application context, and registers factories for the
services it provides.  A service factory is a lambda that takes in a toolbox with the service's dependencies, and returns a provider for the service.  A provider is a simple object that provides an asynchronous `get` method to retrieve the service implementation.  Different types of providers can implement service management strategies like singleton, pool, and refresh cache.


### Service Interface

```
export interface MyService {
    bla():void;
}
```

### Service Driver


```
import MyService from './MyServiceInterface';

...

class MyThing implements MyService {
    bla() {
        console.log("bla!");
    }
}
...

const driverName = 'driver/myCo/myModule/myThing';

AppContext.get().then(

    async (cx) => {
        const toolKeys = {
            'interface/littleware/fetch': 'fetch',
            'interface/littleware/i18n': 'i18n',
            'config/myCo/myModule': 'config',
            'interface/littleware/pubSub': 'pubSub'
        };
        cx.putDefaultConfig('myCo/myModule', defaultConfig);
        cx.putDefaultTranslations(myTranslations);
        cx.putProvider(
          'driver/myCo/myModule/myThing',
          toolKeys,
          async (toolbox) => {
            let tools = await getTools(toolbox);
            doSomeSetup(tools);
            return new LazyProvider(
                () => new MyThing(tools)
            )
          }
        );
    }
);

export thingProvider:Provider<MyThing> = AppContext.get().then(
    cx => cx.getProvider('/driver/myCo/myModule/myThing')
);

```

### Application Launcher

```
const appConfig:AppContextConfig = {
    configHref: [ "/config/file1.json", "/config/file2.json" ],
    fetch: (href) => fetch(href).then(res => res.json())
};

AppContext.build(appConfig).then(
    cx => cx.start()
).then(
    () => thingProvider.get()
).then(
    (thing) => thing.go()
);

```

## I18n

Simple keyword based i18n resolution accepts a context and a keyword.  For example, the context might be "signin", and the keyword might be "login".  The i18n database first tries to find an exact match, then falls through to a no-context match.

The i18n driver loads locale-specific configuration defined in 'littleware/i18n'.



## lw-app-context Custom Element
