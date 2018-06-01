import {html, TemplateResult} from '../../../../lit-html/lit-html.js';

export const meta = html`
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="Content-Security-Policy" 
    content="default-src 'none'; 
    img-src 'self' data: https://www.google-analytics.com; 
    script-src 'self' https://www.google-analytics.com; 
    style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; 
    object-src 'none'; 
    font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com"
    >
<meta name="viewport" content="width=device-width" />
`;

export const links = html`
<link href="https://unpkg.com/purecss@1.0.0/build/pure-min.css" 
      integrity="sha384-nn4HPE8lTHyVtfCBi5yW9d20FjT8BJwUXyWZT9InLYax14RDjBj46LmSztkmNP9w"
      crossorigin="anonymous" /> ;
<link href="https://fonts.googleapis.com/css?family=Noto+Sans|Oswald" crossorigin="anonymous" />
<link href="/modules/font-awesome/css/font-awesome.min.css", integrity: "" })
`;

export const css = html`
<style id="styleGuide_css">
/* see https://www.smashingmagazine.com/2014/07/bem-methodology-for-small-projects/ */

* {
    box-sizing: border-box;
}

body {
    font-family: 'Oswald script=all rev=4', Verdana, sans-serif;
    color: #222222;
    background-color: #eeeeee;
}

h1,h2,h3,h4 {
    font-weight: normal;
    font-family: 'Noto Sans', sans-serif;
    margin-top: 10px;
    margin-bottom: 10px;
}

.pure-g [class*=pure-u] {
    font-family: 'Oswald script=all rev=4', Verdana, sans-serif; 
    font-weight: 300;
}


.pure-menu-link {
    font-family: 'Noto Sans', sans-serif;
}

.pure-menu-list_wrap {
	white-space:normal;
}

/*---------------------------------------*/

.lw-icon__57x57 {
    width: 57px;
    height: 57px;
}

.lw-content {
    padding: 10px;
}

.lw-colorswatch {
    width: 100px;
    height: 300px;
    padding: 10px;
    background-color:white;
}



.lw-colorswatch__box_fill_lwblue {
    fill: #0BDAF7
}

.lw-colorswatch__box_fill_lwgreen {
    fill: #474;
}

.lw-colorswatch__box_fill_lwwhite {
    fill: #eeeeee;
}

.lw-colorswatch__box_fill_lwblack {
    fill: #222222;
}

.lw-colorswatch__box_fill_lwgray {
    fill: #777;
}

/*------------------------------------
 * Simple CSS Modal:
 *    https://www.webdesignerdepot.com/2012/10/creating-a-modal-window-with-html5-and-css3/
 */
 .lw-modalDialog {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background: rgba(0,0,0,0.8);
	z-index: 99999;
	opacity:0;
	transition: opacity 400ms ease-in;
	pointer-events: none;
}

.lw-modalDialog:target, .lw-modalDialog_open {
	opacity:1;
	pointer-events: auto;
}

.lw-modalDialog__content {
	width: 330px;
	position: relative;
	margin: 10% auto;
	padding: 5px 20px 13px 20px;
	border-radius: 10px;
	background: #fff;
	background: -moz-linear-gradient(#fff, #999);
	background: -webkit-linear-gradient(#fff, #999);
	background: -o-linear-gradient(#fff, #999);
}

.lw-modalDialog__closeX {
	background: #606061;
	color: #FFFFFF;
	line-height: 25px;
	position: absolute;
	right: -12px;
	text-align: center;
	top: -10px;
	width: 24px;
	text-decoration: none;
	font-weight: bold;
	-webkit-border-radius: 12px;
	-moz-border-radius: 12px;
	border-radius: 12px;
	-moz-box-shadow: 1px 1px 3px #000;
	-webkit-box-shadow: 1px 1px 3px #000;
	box-shadow: 1px 1px 3px #000;
}

.lw-modalDialog__closeX:hover { background: #00d9ff; }

.lw-smiley {
    color:green; font-weight:bold; font-size:large;
}

</style>
`;