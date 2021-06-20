import { loadConfig } from '../simpleLoader.js';

const configPath = `${__dirname}/testConfig.json`;

describe('the simpleLoader', () => {
  it('loads config from json file', async (done) => {
    try {
      const config = await loadConfig(configPath);
      expect(config.idpConfigUrl).toBe('https://accounts.google.com/.well-known/openid-configuration');
      done();
    } catch (err) {
      done.fail(err);
    }
  });
});
