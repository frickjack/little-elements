import AppContext, { getTools } from '../appContext.js';

const toolKeys = {
  config: 'config/littleware/little-elements/appContextSpec',
};

const testConfig = {
  a: 1,
  whatever: 'bla',
};

describe('the application context (appContext)', () => {
  it('can provide tools onStart', (done) => {
    AppContext.get().then(
      (cx) => cx.onStart(toolKeys, (toolBox) => getTools(toolBox)),
    ).then(
      (boxOfTools) => {
        expect(!!boxOfTools).toBe(true, 'app context delivers tools');
        done();
      },
    );
  });

  it('signals the build barrier', (done) => {
    AppContext.get().then(
      (cx) => {
        expect(cx).toBeDefined();
        done();
      },
    );
  });

  it('looks up config after start', (done) => {
    AppContext.get().then(
      (cx) => cx.getConfig('whatever'),
    ).then(
      (configEntry) => {
        expect(!!configEntry).toBe(true, 'got config');
        done();
      },
    );
  });

  it('provides tools after start', (done) => {
    AppContext.get().then(
      (cx) => cx.getProvider('config/whatever'),
    ).then(
      (configProvider) => {
        expect(configProvider).toBeTruthy();
        done();
      },
    );
  });
});

AppContext.get().then(
  (cx) => {
    cx.putDefaultConfig(toolKeys.config, testConfig);
  },
);
