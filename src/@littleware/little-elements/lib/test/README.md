littleware.test
================

Some utilities for javascript unit tests with jasmine.

Note that jasmine is loaded as a non-module.
The idea is jasmine is part of the underlying
test runtime, so Karma or node or a browser page
setup a jasmine runtime with appropriate reporters, etc, and the application tester just plugs into it.
