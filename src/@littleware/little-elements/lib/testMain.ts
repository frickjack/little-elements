import '../common/appContext/spec/appContextSpec.js';
import '../common/appContext/spec/consoleLoggerSpec.js';
import '../common/appContext/spec/eventBusSpec.js';
import '../common/appContext/spec/i18nSpec.js';
import '../common/appContext/spec/sharedStateSpec.js';
import '../common/spec/miscSpec.js';
import '../common/spec/mutexHelperSpec.js';
import '../common/spec/providerSpec.js';
import AppContext from './appContext/appContext.js';
import { loadConfig } from './appContext/simpleLoader.js';
import './appContext/spec/appContextSpec.js';
import './arrivalPie/spec/arrivalPieSpec.js';
import './authMgr/spec/authControlSpec.js';
import './authMgr/spec/authUiSpec.js';
import './littleDropDown/spec/littleDropDownSpec.js';
import './littleHeader/spec/headerSimpleSpec.js';
import './styleGuide/spec/styleGuideSpec.js';
import './test/spec/utilSpec.js';

import { startTest } from './test/util.js';

AppContext.build({ configHref: [], loadConfig }).then(
  (cx) => cx.start(),
).then(
  () => startTest(),
);
