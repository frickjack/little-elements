# TL;DR

Some thoughts on how design drives architecture.

# Problem and Audience

A good understanding of a system's UX design drives the architecture of the underlying software that implement that design.  The CSS rules, the site map and navigation experience, and the javascript component hierarchy and state management all rely on the developer's mental model of the design she is implementing.  Unfortunately, many software developers like myself struggle with UX design.  I have held wrong ideas about the relationship between design and software - like believing that design is a separate less technical (less valuable) process from software development, or that an arbitrary design can be layered on top of a web site after it is built (I'll transition to hugo, and slap a nice hugo theme on the site; we'll just change the CSS; we'll build a skin-able system).
In fact, it is difficult to build a web site with a consistent overall UX design implemented in a way that can evolve over time and support simple user customization (like a dark theme) while maintaining a comprehensible code base.  The good thing about being bad at web design is that there are many opportunities to learn and improve.  The bad thing about being bad at web design is that my site sucks - which is the only thing a user cares about.

Design and developer teams need to work together to agree on a mental model for a site's structure and behavior, then codify that model in UX guidelines.  Implementing UX guidelines is an evolutionary process that yields artifacts like documentation explaining the high level concepts of the design, tutorials, how-tos, design tools, CSS baselines, component libraries, and SOP's for the processes that shape the teams' daily work.  

The UX guidelines for a large organization can become a sprawling manifesto (like Google's [material design](https://material.io/design) or Apple's [human interface guidelines](https://developer.apple.com/design/)), but it doesn't have to be complicated for small teams.  The important task for the design and dev teams is to come up with a way to effectively communicate and record the ideas that connect design to development in UX guidelines, and agree on a contract that a design and its implementation must both conform to the guides.  For example, if the UX guide defines three high level page elements (navigation, content, whitespace, and actions), then a designer should not introduce a new type of element (media player, user documentation, feedback form) without also working through a process to extend the UX guide and its surrounding tools.  Anyway, that's my thinking as of this morning, and this document is a small beginning for littleware's UX guide.

The "Bla Guide" model may work well for managing the interaction between other teams as well.  It is easy to imagine security, infrastructure and operations, hr, product management, and qa guidelines that are similar to UX guides in their complexity, tooling, and evolution.  Inevitably we will need "guidelines for guidelines".

# Littleware UX Guidelines

## Elements of a page

The elements of a littleware web page may each be classified as either content, metadata, whitespace, or actions.  The content is the information that the page wants to present to the user, or more generally where the page engages in a conversation with the user.  The content of a blog post would be the blog's essay.  The content of a feedback form would be the form.  The content of a data dashboard would be the data presentation.

Actions are elements like buttons and forms that present a call to action to the visitor.  The "Add to Basket" button on a product detail page is an action, and so is the "enter your e-mail to download our marketing pdf" form on a CRM teaser page.  An action is usually a child element of an enclosing content block.

Metadata presents non-content information on topics like the site, page content, author, or publisher.  The navigation elements in the page header are metadata, and so are the various "About us" links in the footer.  Metadata should be easy to access and understand, but it should not distract from the content.

Whitespace is the empty space that separates content, metadata, and action blocks.

### CSS variables for page elements

Littleware's [base style helper](https://github.com/frickjack/little-elements/blob/main/src/%40littleware/little-elements/lib/styleGuide/styleGuide.css.ts) defines a series of [CSS properties (variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) and rules for rendering different elements of a page with a consistent color and font scheme based on the element type.  A site may override these variables to define its own style.

Content regions should define style rules with the `--lw-primary-text-color`, `--lw-primary-bg-color`, and `--lw-primary-font-family` variables.  We assume section (`<section>`) blocks hold content, and we define separate CSS classes to allow different background and border colors for different content blocks - `lw-section-block1`, `lw-section-block2`, etc.  We decided that using a different background color (or even a gradient) for content sections was too distracting, so we use color in more subtle ways like applying it to the bottom border of content sections and the border of content tiles.  Since CSS properties cascade in a cool way, the different `lw-section-block...` CSS classes can each define its own border color property (`--lw-section-border-color: var(--lw-sec1-border-color);`) that contained elements like tiles can leverage.

```
:root {
    --lw-primary-text-color: #222222;
    --lw-primary-bg-color: #fefefe;
    --lw-secondary-bg-color: #fafafa;
    --lw-primary-font-family: 'Oswald script=all rev=4', Verdana, sans-serif;
    --lw-sec1-border-color: #bb38b7;
    --lw-sec1-bg-gradient: linear-gradient(var(--lw-primary-bg-color), #fad7f6);
    --lw-sec2-border-color: #0bf749;
    --lw-sec2-bg-gradient: linear-gradient(var(--lw-primary-bg-color), #f1fff1);
    ...
}

...

section {
    font-family: var(--lw-primary-font-family);
    background-color: var(--lw-primary-bg-color);
    color: var(--lw-primary-text-color);
    padding: 10px 5px;
}

.lw-section-block1 {
    font-family: var(--lw-primary-font-family);
    --lw-section-border-color: var(--lw-sec1-border-color);
    border-bottom: thin solid var(--lw-section-border-color);
    min-height: 100px;
    background-color: var(--lw-primary-bg-color);
}

.lw-section-block1_gradient {
    background: var(--lw-sec1-bg-gradient);
    background-color: var(--lw-primary-bg-color);
}

...

/*--- rules for tiles ---- */

.lw-tile-container {
    display: flex;
    flex-wrap: wrap;
    background-color: var(--lw-whitespace-bg-color);
}

.lw-tile {
    width: 300px;
    height: 250px;
    padding: 10px;
    margin: 10px;
    border-radius: 5px;
    border: solid thin var(--lw-section-border-color);
    overflow: hidden;
    background-color: var(--lw-primary-bg-color);
}

```

The set of CSS rules for metadata-type elements has its own font-family and color scheme.  A background color gradient helps distinguish metadata blocks from the content elements that a visitor should focus on.

```
:root {
    ...
    --lw-secondary-text-color: #777;
    --lw-secondary-bg-color: #fafafa;
    --lw-header-background-color: var(--lw-primary-bg-color);
    --lw-secondary-font-family: 'Noto Sans', sans-serif;
    --lw-nav-border-color: #0BDAF7;
    --lw-nav-bg-gradient: linear-gradient(var(--lw-header-background-color), #f0fdff);
    ...
}

...

h1,h2,h3,h4 {
    color: var(--lw-secondary-text-color);
    font-weight: normal;
    font-family: var(--lw-secondary-font-family);
    margin-top: 10px;
    margin-bottom: 10px;
}

header {
    font-family: var(--lw-secondary-font-family);
    background-color: var(--lw-secondary-bg-color);
    color: var(--lw-secondary-text-color);
}

footer {
    font-family: var(--lw-secondary-font-family);
    background-color: var(--lw-secondary-bg-color);
    color: var(--lw-secondary-text-color);
}

.lw-nav-block {
    font-family: var(--lw-secondary-font-family);
    border-bottom: thin solid var(--lw-nav-border-color);
    background-color: var(--lw-secondary-bg-color);
}

.lw-nav-block_gradient {
    background: var(--lw-nav-bg-gradient);
    background-color: var(--lw-secondary-bg-color);
}

...

```

Finally, the whitespace separating different content and metadata blocks has its own background color to clarify the page structure for the user.

```
:root {
    --lw-whitespace-bg-color: #f2f2f4;
    ...
}

...

body {
    ...
    background-color: var(--lw-whitespace-bg-color);
}

...
/*--- rules for tiles ---- */

.lw-tile-container {
    display: flex;
    flex-wrap: wrap;
    background-color: var(--lw-whitespace-bg-color);
}

...

```

### The Rotating Hamburger and OG Javascript

We added a hamburger menu to the header of https://apps.frickjack.com to allow a visitor to easily navigate between the different parts of the site.  I like the CSS animation that rotates the hamburger to an "X" when opening, then back to a hamburger when closing.  We implement that hamburger and the other drop-down menus on the site with a [lw-drop-down](https://github.com/frickjack/little-elements/tree/main/src/%40littleware/little-elements/lib/littleDropDown) web component that wraps the [purecss menu](https://purecss.io/menus/). 

The `lw-drop-down` web component takes advantage of some of the [drop-down](https://purecss.io/js/menus.js) and [hamburger](https://purecss.io/layouts/tucked-menu-vertical/) example code from the purecss web site.  The sample code is written in an old-school [jQuery](https://jquery.com) style where the code keeps all its state in the DOM by tracking the custom CSS rules attached to different elements.  For example, when the user clicks on the hamburger, the javascript event listener directly modifies the CSS rules attached to different DOM elements. [Bootstrap](https://getbootstrap.com/) is a popular framework with components that rely on this style of code.

We intend to refactor our `lw-drop-down` code to a more modern [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) (or [component](https://en.wikipedia.org/wiki/Composite_pattern)) style that tracks the UI state in javascript variables that drive a render template.  For example, when a user clicks on the hamburger, a javascript event listener modifies the javascript variables that feed a template system that manipulates the DOM.  [React](https://reactjs.org/), [Angular](https://angularjs.org/), [Ember](https://emberjs.com/), and [Vue](https://vuejs.org/v2/guide/) follow this pattern.


### Hugo Shortcodes for Content Tiles

[Hugo shortcodes](https://gohugo.io/content-management/shortcodes/) provide a mechanism to safely embed custom html into the markdown files that a hugo content author works with.
We provide simple `tilecanvas` and `tile` shortcodes to allow an author to indicate that her content may be presented as tiles.  The shortcodes are defined in the "littleware" hugo theme under the [little-apps github repo](https://github.com/frickjack/little-apps/tree/main/hugo-site/hugo-theme-littleware/layouts/shortcodes).

tilecanvas:
```
<div class="lw-tile-container">
    {{ .Inner }}
</div>
```

tile:
```
<div class="lw-tile">
    {{ .Inner | markdownify }}
</div>
```

# Summary

UX designers and software developers need to clearly communicate UX guidelines that establish a shared mental model for how to describe an implement the user experience.

# More Resources

* [littleware styleHelper README](https://github.com/frickjack/little-elements/tree/main/src/%40littleware/little-elements/lib/styleGuide)
* [styleHelper test suite](https://apps.frickjack.com/modules/1.6.0/@littleware/little-elements/web/lib/styleGuide/index.html)
* [littleware web shell bLog post](https://blog.frickjack.com/2018/10/little-elements-webapp-shell.html)
