namespace littleware {
  export namespace arrivalPie {

    interface Arrival {
      startAngle: number;
      durationDegrees: number;
    }

    /**
     * Utility helper function - exported for testing
     */
    export function arrivalListToString( arrivalList:Array<Arrival> ):string {
      return arrivalList.map(
        (arr) => { return "" + arr.startAngle + "," + arr.durationDegrees + ";"; }
      ).reduce(
        (acc,s) => { return acc + s; }, ""
      );
    }

    /**
     * Utility helper function - exported for testing
     */
    export function stringToArrivalList( arrivalListStr:string ):Array<Arrival> {
      if ( ! arrivalListStr ) { return []; }
      let clean = arrivalListStr.replace( /\s+/g, "" );
      return clean.split( ";" ).map( (part) => {
        return part.split( "," ).map( (s) => Number(s) );
      }).filter( (tuple) => { 
        return tuple.length === 2 && (! isNaN(tuple[0])) && (! isNaN(tuple[1])); 
      }).map( (tuple) => {
        return { startAngle: tuple[0], durationDegrees:tuple[1] }; 
      });
    }

    /**
     * Build the SVGPath that visually represents the given arrival data.
     * Exported for testing.
     * 
     * @param data
     * @return SVGPathElement 
     */
    export function buildPath( data:Arrival ): SVGPathElement {
      let namespace = "http://www.w3.org/2000/svg"; //   this.querySelector( "svg" ).namespaceURI;
      let path = document.createElementNS( namespace, "path" ) as SVGPathElement;
      //let path = new SVGPathElement();
      //<path class="arrpie-pie" style="fill:green; stroke:red;stroke-width:2" d="M50,50 L50,5 A45,45 0 0,1 95,50 z"></path>
      path.setAttribute( "class", "lw-arrpie__slice" );
      if ( data.durationDegrees > 90 ) {
        throw new Error( "Obtuse angles not yet supported" );
      }
      let rads = data.durationDegrees * Math.PI / 180;
      let y = 50 - 45 * Math.cos( rads ); // relative to y-axis, so cos instead of sin
      let x = 45 * Math.sin( rads ) + 50; // relative to y-axis, so r * sin( theta )
      path.setAttribute( "d", "M50,50 L50,5 A45,45 0 0,1 " + x + "," + y + " z" );
      //path.setAttribute( "d", "M50,50 L50,5 L" + x + "," + y + " z" );
      path.setAttribute( "transform", "rotate( " + data.startAngle + " 50 50 )" );
      return path;
    }


    /**
     * ArrivalPie custom element
     */
    export class ArrivalPie extends HTMLElement {
        private _initialized:boolean;

        // Can define constructor arguments if you wish.
        constructor() {
          // If you define a ctor, always call super() first!
          // This is specific to CE and required by the spec.
          super();

          // Note - constructor must return element without children
          //   for document.createElement to work properly'
          this._initialized = false;
        }

        /**
         *  Monitor the 'name' attribute for changes, see:
         *     https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
         */
        static get observedAttributes():Array<string> { return ['arrival-list']; }

        connectedCallback(): void {
          this._init();
        }

        disconnectedCallback(): void {
          //console.log( "Disconnected!" );
        }

        attributeChangedCallback(attrName?: string, oldVal?: string, newVal?: string): void {
          //console.log( "Attribute change! " + attrName );
          this._render();
        }

        adoptedCallback(): void {

        }

        private _init():void {
            /*
            // Setup a click listener on <app-drawer> itself.
            this.addEventListener('click', e => {
              // Don't toggle the drawer if it's disabled.
              if (this.disabled) {
                return;
              }
              this.toggleDrawer();
            });
            */
            if ( this._initialized ) {
              return;
            }
            let template = document.querySelector( 'template[id="lw-arrival-pie-top"]' ) as HTMLTemplateElement;
            if ( ! template ) {
              throw new Error( "ArrivalPie template not loaded: lw-arrival-pie-top" );
            }
            let clone = document.importNode( template.content, true );
            //this.innerHTML = "<div><h3>Hello from ArrivalPie!</h3></div>";
            this.appendChild( clone );
            this._initialized = true;
        }

        /**
         * Rebuild the path elements under the arrpie-pielist group
         * Note: only public to fascilitate testing
         */
        _render():void {
          this._init();
          this._renderPie( this.getAttribute( "arrival-list" ) );
        }

        private _renderPie( arrivalListSpec:string ):void {
          let g = this.querySelector( "g.lw-arrpie__pielist" );
          // remove all current paths
          while( g.hasChildNodes() ) {
            g.removeChild( g.lastChild );
          }
          this.arrivalList.forEach(
            (arr) => {
              g.appendChild( buildPath(arr) );
            }
          );
        }

        
        get arrivalList():Array<Arrival> {
          var result = [];
          return stringToArrivalList( this.getAttribute( "arrival-list" ) );
        }

        set arrivalList( val:Array<Arrival> ) {
          this.setAttribute( "arrival-list", arrivalListToString( val ) );
        }
      
    }

    window.customElements.define( "lw-arrival-pie", ArrivalPie );

    
}}