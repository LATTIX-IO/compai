jest.mock('@db', () => ({ db: {} }));

describe('security penetration tests service lazy init', () => {
  it('loads the service module without eagerly requiring the Maced ESM client', () => {
    expect(() =>
      require('./security-penetration-tests.service'),
    ).not.toThrow();
  });
});