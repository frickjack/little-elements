import './styleGuide.js'

const div = document.querySelector( "div#modalDemo" );
const button = document.querySelector( "button#modalDemoOpen" );
const closeX = div.querySelector( "a.lw-modalDialog__closeX" );

function openDialog(ev) {
    div.classList.add( "lw-modalDialog_open" );
}

button.addEventListener( "click", openDialog );

closeX.addEventListener( "click", function(ev) {
    ev.preventDefault();
    div.classList.remove( "lw-modalDialog_open" );
});
