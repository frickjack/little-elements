import {html} from "../../../../../../lit-html/lit-html.js";

const template = html`
<header>
    <lw-header-simple title="Home">
    </lw-header-simple>
</header>
<section class="lw-section lw-overview">
   <h2> Overview </h2>
    <p>Reuben's dev sandbox</p>
</section>
<section class="lw-section lw-section__apps">
    <h2>Apps</h2>

    <div class="pure-menu">
        <ul class="pure-menu-list" id="appmenu">
            <!-- li class="pure-menu-item"><a class="pure-menu-link" href="./eventTrack/littleToDo.html"><img class="lw-icon__57x57" src="./resources/img/checkbox.svg" alt="little ToDo icon" /><br />
                little ToDo
                </a>
            </li -->
            <li class="pure-menu-item"><a class="pure-menu-link" href="/511/index.html"><img class="lw-icon__57x57" src="./resources/img/511.svg" alt="511 icon" />
                    <br/>511 app</a>
            </li>

        </ul>
    </div>
</section>
<section class="lw-section lw-section__connect">
    <h2>Connect</h2>

    <div class="pure-menu pure-menu-horizontal">
        <ul class="pure-menu-list pure-menu-list_wrap" id="appmenu">
            <li class="pure-menu-item"><a href="https://blog.frickjack.com" class="pure-menu-link" title="bLog">bLog</a></li>
            <li class="pure-menu-item"><a href="https://twitter.com/catdogboy" class="pure-menu-link" title="Twitter"><i class="fa fa-twitter fa-2x"></i></a></li>
            <li class="pure-menu-item"><a href="https://www.github.com/frickjack" class="pure-menu-link" title="Github"><i class="fa fa-github fa-2x"></i></a></li>
            <li class="pure-menu-item"><a href="https://www.linkedin.com/in/reuben-pasquini-a16b6721" class="pure-menu-link" title="Linked In"><i class="fa fa-linkedin fa-2x"></i></a></li>
            <li class="pure-menu-item"><a href="http://stackoverflow.com/users/story/1704760?view=Timeline" class="pure-menu-link" title="Stack Overflow"><i class="fa fa-stack-overflow fa-2x"></i></a></li>
            <li class="pure-menu-item"><a href="https://hub.docker.com/u/frickjack/" class="pure-menu-link" title="Docker Hub">dockerhub</a></li>
            <li class="pure-menu-item"><a href="https://www.npmjs.com/~frickjack" class="pure-menu-link" title="npmjs.com">npmjs</a></li>
        </ul>
    </div>
</section>
<section class="lw-section lw-section__littleware">
    <h2>littleware</h2>

    <div class="pure-menu">
        <ul class="pure-menu-list" id="appmenu">
            <li class="pure-menu-item"><a href="{{ jsroot }}/@littleware/little-elements/lib/test/index.html" class="pure-menu-link" title="test">test support</a></li>
            <li class="pure-menu-item"><a href="{{ jsroot }}/@littleware/little-elements/lib/arrivalPie/index.html" class="pure-menu-link" title="arrival-pie custom element">lw-arrival-pie custom element</a></li>
            <li class="pure-menu-item"><a href="{{ jsroot }}/@littleware/little-apps/lib/headerSimple/index.html" class="pure-menu-link" title="header-simple custom element">lw-header-simple custom element</a></li>
            <li class="pure-menu-item"><a href="{{ jsroot }}/@littleware/little-elements/lib/styleGuide/index.html" class="pure-menu-link" title="littleware style guide">style guide</a></li>
        </ul>
    </div>
</section>
`;
