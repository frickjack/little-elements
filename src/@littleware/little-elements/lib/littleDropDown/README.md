# lw-drop-down Custom Element

A custom element for automating some of the management around [pure menus](https://purecss.io/menus/)

[Test case](./index.html)

## Overview

Purecss provides a set of minimal CSS modules including a menu system.  This component automates some of the templating for the menu system, and integrates javascript handlers for drop-downs and menu selection events.

In its simplest mode of operation - the element just wraps DOM that the client inlines within the element.

## Configuration

The menu is configured via javascript properties that
map keys to either navigation url's.

```
{
    "path1": {
        "label": "whatever",
        "href": "/path/bla",
        "class": ""
    }
}
```

Configuration can also be specified or augmented with an application context parent component including internationalization.

ex:
```
<lw-drop-down context="/menus/signin" />
```