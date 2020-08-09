# lw-auth-mgr Custom Element

A custom element for managing login, logout, user-info UX.

[Test case](./index.html)

## Overview

This component usually renders as a simple menu-button with different menu-items for different actions depending on its state.

* `Aunonimous` state - the user either does not have an active authenticated session with the api, or it has a limited session as an anonymous user - offers the following actions:
    - `Login`
* `Authenticated` state - the user has logged into the backend, and has an active authenticated session with the api - offers the following actions by default, but may be configured to add addtional actions:
    - `Logout`

