import {
  buildSocialProviders,
  getTrustedProviderNames,
  isStaticTrustedOrigin,
  originMatchesPattern,
  shouldEnableEmailAndPassword,
  shouldEnableMagicLink,
  validateAuthRuntimeConfig,
} from './auth-deployment.config';

describe('auth deployment config', () => {
  it('supports wildcard trusted origins from AUTH_TRUSTED_ORIGINS', () => {
    expect(
      originMatchesPattern(
        'https://portal.internal.example.com',
        'https://*.internal.example.com',
      ),
    ).toBe(true);
    expect(
      isStaticTrustedOrigin('https://portal.internal.example.com', {
        AUTH_TRUSTED_ORIGINS:
          'http://localhost:3000,https://*.internal.example.com',
      }),
    ).toBe(true);
  });

  it('limits social providers and disables email auth when a provider is enforced', () => {
    const env = {
      AUTH_ENFORCED_PROVIDER: 'microsoft',
      AUTH_GOOGLE_ID: 'google-id',
      AUTH_GOOGLE_SECRET: 'google-secret',
      AUTH_MICROSOFT_CLIENT_ID: 'microsoft-id',
      AUTH_MICROSOFT_CLIENT_SECRET: 'microsoft-secret',
      AUTH_MICROSOFT_TENANT_ID: 'tenant-guid',
    };

    expect(buildSocialProviders(env)).toEqual({
      microsoft: {
        clientId: 'microsoft-id',
        clientSecret: 'microsoft-secret',
        tenantId: 'tenant-guid',
        prompt: 'select_account',
      },
    });
    expect(getTrustedProviderNames(env)).toEqual(['microsoft']);
    expect(shouldEnableEmailAndPassword(env)).toBe(false);
    expect(shouldEnableMagicLink(env)).toBe(false);
  });

  it('requires a tenant-specific Microsoft configuration when Microsoft is enforced', () => {
    expect(() =>
      validateAuthRuntimeConfig({
        AUTH_ENFORCED_PROVIDER: 'microsoft',
        AUTH_MICROSOFT_CLIENT_ID: 'microsoft-id',
        AUTH_MICROSOFT_CLIENT_SECRET: 'microsoft-secret',
        AUTH_MICROSOFT_TENANT_ID: 'common',
      }),
    ).toThrow(
      'AUTH_ENFORCED_PROVIDER=microsoft requires AUTH_MICROSOFT_TENANT_ID to be set to a specific Entra tenant ID.',
    );
  });

  it('keeps email auth enabled when no provider is enforced', () => {
    const env = {
      AUTH_GOOGLE_ID: 'google-id',
      AUTH_GOOGLE_SECRET: 'google-secret',
    };

    expect(shouldEnableEmailAndPassword(env)).toBe(true);
    expect(shouldEnableMagicLink(env)).toBe(true);
    expect(getTrustedProviderNames(env)).toEqual(['google']);
  });
});
