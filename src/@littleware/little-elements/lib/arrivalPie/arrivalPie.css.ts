import {html} from "../../../../../lit-html/lit-html.js";

/*
src/@littleware/little-elements/modules/arrivalPie
modules/
site/index.html
*/
export const css = html`
<style id="lw-arrivalPie-css">
lw-arrival-pie {
  width: 100px;
  height: 100px;
  display: block;
}

svg.lw-arrpie {
  width:"100%";
  height:"100%";
}

circle.lw-arrpie__circle {
  fill: magenta;
  fill-opacity: 0.1;
  stroke-width: 5;
  stroke: green;
}

path.lw-arrpie__slice {
  fill: cornflowerblue;
}
</style>
`;
