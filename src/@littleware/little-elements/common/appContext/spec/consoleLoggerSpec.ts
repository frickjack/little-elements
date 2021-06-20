import { getLogger } from '../consoleLogger.js';

describe('the console logger', () => {
  let logger = null;

  beforeAll(async (done) => {
    logger = await getLogger();
    done();
  });

  it('writes logs', () => {
    expect(logger).not.toBe(null);
    expect(logger).toBeDefined();
    logger.info('info level log');
    logger.warn('a warning!');
    logger.error('an error!');
    logger.debug('some debugging');
    logger.trace('some tracing');
  });
});
