import AppContext, { getTools } from '../../common/appContext/appContext.js';
import { aliasName as loggerAlias, Logger } from '../../common/appContext/logging.js';
import { SharedState } from '../../common/appContext/sharedState.js';

export const stateKey = 'little-elements/lib/appContext/historyHelper';

interface Tools {
  log: Logger;
  state: SharedState;
}

export interface HistoryState {
  hashPath: string;
}

class HistoryHelper {
  public tools: Tools;

  constructor(tools: Tools) {
    this.tools = tools;
  }

  // TODO: i18n, etc
  public popup(): Promise<Record<string, string>> { return null; }

  // TODO: support Undo
  public toaster(): Promise<Record<string, string>> { return null; }

  /**
   * Simple helper - for now just listens for
   * hashchange events, and mirrors the hash
   * to the shared state for state listeners to
   * respond to.
   */
  public hashChangeListener = () => {
    let hashPath = globalThis.location.hash;
    if (hashPath) {
      hashPath = hashPath.slice(1);
    }
    this.tools.state.changeState(
      stateKey,
      () => ({ hashPath } as HistoryState),
    );
  };

  static get providerName() {
    return 'driver/littleware/little-elements/lib/appContext/historyHelper';
  }
}

AppContext.get().then(
  (cx) => {
    cx.onStart({ logger: loggerAlias, state: SharedState.providerName },
      async (toolBox) => {
        const tools: Tools = await getTools(toolBox) as Tools;
        const helper = new HistoryHelper(tools);
        window.addEventListener('hashchange', helper.hashChangeListener);
        helper.hashChangeListener(); // initial state
      });
  },
);
