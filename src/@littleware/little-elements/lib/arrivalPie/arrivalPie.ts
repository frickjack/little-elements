import { render, svg, TemplateResult } from '../../../../../lit-html/lit-html.js';
import { singleton as styleHelper } from '../styleGuide/styleGuide.js';
import { css } from './arrivalPie.css.js';

/**
 * Build the SVGPath that visually represents the given arrival data.
 * Exported for testing.
 *
 * @param data
 * @return SVGPathElement
 */
export function buildPath(data: Arrival): SVGPathElement {
  const namespace = 'http://www.w3.org/2000/svg'; //   this.querySelector( "svg" ).namespaceURI;
  const path = document.createElementNS(namespace, 'path') as SVGPathElement;

  path.setAttribute('class', 'lw-arrpie__slice');
  if (data.durationDegrees > 90) {
    throw new Error('Obtuse angles not yet supported');
  }
  const rads = (data.durationDegrees * Math.PI) / 180;
  const y = 50 - 45 * Math.cos(rads); // relative to y-axis, so cos instead of sin
  const x = 45 * Math.sin(rads) + 50; // relative to y-axis, so r * sin( theta )
  path.setAttribute('d', `M50,50 L50,5 A45,45 0 0,1 ${x},${y} z`);
  // path.setAttribute( "d", "M50,50 L50,5 L" + x + "," + y + " z" );
  path.setAttribute('transform', `rotate( ${data.startAngle} 50 50 )`);
  return path;
}


function templateFactory(pie: ArrivalPie): TemplateResult {
  return svg`
    <svg class="lw-arrpie"
      viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      >

      <!-- rect x="0" y="0" width="100" height="100" style="fill:black" / -->
      <circle cx="50" cy="50" r="45" class="lw-arrpie__circle" />
      <g class="lw-arrpie__pielist">
      ${
  pie.arrivalList.map(
    (arr) => buildPath(arr),
  )
}
      </g>
      <g class="lw-arrpie__ticks">
      </g>
    </svg>
  `;
}

export interface Arrival {
  startAngle: number;
  durationDegrees: number;
}

/**
 * Utility helper function - exported for testing
 */
export function arrivalListToString(arrivalList: Arrival[]): string {
  return arrivalList.map(
    (arr) => `${arr.startAngle},${arr.durationDegrees};`,
  ).reduce(
    (acc, s) => acc + s, '',
  );
}

/**
 * Utility helper function - exported for testing
 */
export function stringToArrivalList(arrivalListStr: string): Arrival[] {
  if (!arrivalListStr) { return []; }
  const clean = arrivalListStr.replace(/\s+/g, '');
  return clean.split(';').map((part) => part.split(',').map((s) => Number(s))).filter((tuple) => tuple.length === 2 && (!Number.isNaN(tuple[0])) && (!Number.isNaN(tuple[1]))).map((tuple) => ({ startAngle: tuple[0], durationDegrees: tuple[1] }));
}

/**
 * ArrivalPie custom element
 */
class ArrivalPie extends HTMLElement {
  /**
     *  Monitor the 'name' attribute for changes, see:
     *     https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
     */
  static get observedAttributes(): string[] { return ['arrival-list']; }

  get arrivalList(): Arrival[] {
    return stringToArrivalList(this.getAttribute('arrival-list'));
  }

  set arrivalList(val: Arrival[]) {
    this.setAttribute('arrival-list', arrivalListToString(val));
  }

  private isInitialized: boolean;

  // Can define constructor arguments if you wish.
  constructor() {
    // If you define a ctor, always call super() first!
    // This is specific to CE and required by the spec.
    super();

    // Note - constructor must return element without children
    //   for document.createElement to work properly'
    this.isInitialized = false;
  }

  public connectedCallback(): void {
    this._init();
  }

  public disconnectedCallback(): void {
    // console.log( "Disconnected!" );
  }

  public attributeChangedCallback(): void {
    // console.log( "Attribute change! " + attrName );
    this._render();
  }

  /**
     * Rebuild the path elements under the arrpie-pielist group
     * Note: only public to fascilitate testing
     */
  public _render(): void {
    this._init();
    this._renderPie();
  }

  private _init(): void {
    if (this.isInitialized) {
      return;
    }
    // NOOP for now
    this.isInitialized = true;
  }

  /**
     * Render a pie given an string specifying a list of arrivals
     */
  private _renderPie(): void {
    render(templateFactory(this), this);
  }
}

window.customElements.define('lw-arrival-pie', ArrivalPie);

export default ArrivalPie;

styleHelper.componentCss.push(css);
styleHelper.render();
