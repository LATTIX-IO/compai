describe('auth.server lazy initialization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      BASE_URL: 'http://localhost:3333',
      SECRET_KEY: 'x'.repeat(32),
      NODE_ENV: 'test',
      AUTH_ENFORCED_PROVIDER: 'microsoft',
      AUTH_MICROSOFT_CLIENT_ID: 'test-client-id',
      AUTH_MICROSOFT_CLIENT_SECRET: 'test-client-secret',
      AUTH_MICROSOFT_TENANT_ID: '11111111-1111-1111-1111-111111111111',
      UPSTASH_REDIS_REST_URL: '',
      UPSTASH_REDIS_REST_TOKEN: '',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('can be required without eagerly importing the better-auth runtime', () => {
    expect(() => {
      jest.isolateModules(() => {
        jest.doMock('../config/load-env', () => ({}));
        jest.doMock('@db', () => ({ db: {} }));
        const authModule = require('./auth.server');

        expect(typeof authModule.getAuth).toBe('function');
        expect(typeof authModule.auth.api.getSession).toBe('function');
        expect(typeof authModule.auth.api.hasPermission).toBe('function');
      });
    }).not.toThrow();
  });
});