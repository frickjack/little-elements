import './test/spec/utilSpec.js';
import './styleGuide/spec/styleGuideSpec.js';
import '../common/spec/mutexHelperSpec.js';
import './arrivalPie/spec/arrivalPieSpec.js';
import {startTest} from './test/util.js';


window.addEventListener('load', function() {
    startTest();
});