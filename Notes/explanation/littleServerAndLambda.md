# TL;DR

The `little-server` launches an [expressjs]() web server to facilitate local testing of littleware webapps.

## Overview

The `little-server` serves webapps that follow the set of conventions expected of littleware web applications.  By conforming to the littleware conventions a littleware webapp can leverage the `little-server` rather than implement its own server infrastructure.

## Use

```
little-server path1 filepath1 path2 filepath2 ...
```
where `path*` is a subpath of the `localhost` server, and `filepath*` is either a path to a local folder to server static files from, or a path to a javascript file that exports an `expressHandler` function with signature:
```
export function expressRouter(): Promise<Router>;
```

The server also automatically includes a rule mapping `/modules/` to `./node_modules/`.
For example - from `package.json`:
```
node commonjs/bin/little-server.js /modules/@littleware/little-elements/web/ ./web/ /admin module:./commonjs/bin/helloHandler.js
```

## Testing with a self signed certificate

Generate a self signed certificate, and save it to the gnome passwords and keys service.

```
openssl genrsa -out localhost.key 2048
openssl req -new -x509 -key localhost.key -out localhost.cert -days 3650 -subj /CN=localhost

secret-tool store --label littleware/certs/localhost/key group littleware path littleware/certs/localhost/key < localhost.key 
secret-tool store --label littleware/certs/localhost/cert group littleware path littleware/certs/localhost/cert < localhost.cert
```

Set the `LITTLE_LOCALHOST` environment variable to configure the test server to load the certificate, and setup a TLS endpoint at https://localhost:3443/

```
export LITTLE_LOCALHOST="${XDG_RUNTIME_DIR}/localhost"
mkdir -p "$LITTLE_LOCALHOST"
secret-tool lookup group littleware path littleware/certs/localhost/key > "$LITTLE_LOCALHOST/localhost.key"
secret-tool lookup group littleware path littleware/certs/localhost/cert > "$LITTLE_LOCALHOST/localhost.cert"
```

## Lambda Wrapper

The express lambda wrapper module exports a helper function that wraps an AWS lambda handler with an express `Router`:
```
export function expressWrap(lambdaHandler: (event, context) => Promise<any>): Promise<Router> { ... }
```

So a module that exports a lambda handler may also export an `expressRouter` factory:

```
export function expressRouter():Promise<Router> {
    return expressWrap(lambdaHandler);
}
```
