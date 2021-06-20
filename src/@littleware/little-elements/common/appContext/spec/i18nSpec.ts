import { getI18n } from '../i18n.js';

describe('appContext i18n support', () => {
  let i18n = null;

  beforeAll(async (done) => {
    i18n = await getI18n();
    done();
  });

  it('can apply en translations from the little-elements package', async (done) => {
    expect(i18n).not.toBeNull();
    const tr = await i18n.getFixedT(null, ['little-elements']);
    expect(i18n.t('ok')).toBe('ok');
    expect(i18n.t('cancel')).toBe('cancel');
    expect(i18n.t('bogus', 'whatever')).toBe('whatever');
    expect(i18n.t('little-elements:test')).toBe('for the test case');
    // without explicit namespace
    expect(i18n.t('test')).toBe('whatever');
    expect(tr('test')).toBe('for the test case');
    done();
  });
});
