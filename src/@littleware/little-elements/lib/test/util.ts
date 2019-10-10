declare var littleware: any;

/**
 * Get a stage (HTML <section>) where a test can manipulate DOM.  If id is supplied,
 * then return the previously created section with the given id attribute if any -
 * otherwise assign the id to the new stage.
 *
 * @param id optional id to retrieve if present - or assign to new stage
 * @param title optional title (and heading) to attach to a new stage
 * @return HTMLSection
 */
export function getStage( id?: string, title?: string ): Element {
    let section = id ? document.body.querySelector( 'section[id="' + id + '"]' ) : null;
    if ( section ) {
        return section;
    }
    section = document.createElement( "section" );
    if ( id ) { section.setAttribute( "id", id ); }
    if ( title ) {
        section.setAttribute( "title", title );
        const heading = document.createElement( "h2" ) as HTMLHeadingElement;
        heading.textContent = title;
        section.appendChild( heading );
    }
    // Place stages before the Jasmin reporting area if present - otherwise append to body
    const jreport = document.body.querySelector( 'div[class="jasmine_html-reporter"]');
    if ( jreport ) {
        jreport.parentNode.insertBefore( section, jreport );
    } else {
        document.body.appendChild( section );
    }
    return section;
}

/**
 * Little helper to kick off the test runner
 * of the underlying platform.  Assumes
 * either Karma runtime or
 * jasmine brower runtime (via littleJasmineBoot).
 */
export function startTest() {
    // see styleGuide/shell/basicShell.html.njk
    const shellPromise = globalThis.littleShell ? globalThis.littleShell.clear() as Promise<string> : Promise.resolve("ok");

    shellPromise.then(
        () => {
            if ( littleware.test.startJasmine ) {
                // This is not necessary when running with Karma ...
                // tslint:disable-next-line
                console.log("Bootstrapping jasmine");
                littleware.test.startJasmine();
            } else if ( typeof (window as any).__karma__ !== "undefined" ) {
                // tslint:disable-next-line
                console.log("Bootstrapping karma which is natively module aware");
            } else {
                // tslint:disable-next-line
                console.log("No test bootstrap present on page");
            }
        },
    );
}
