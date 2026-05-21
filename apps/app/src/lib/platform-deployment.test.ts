import { describe, expect, it } from 'vitest';
import {
  getAppBranding,
  getBrandInitials,
  getVisibleAuthOptions,
  shouldShowDefaultBrandLogo,
} from './platform-deployment';

describe('platform deployment helpers', () => {
  it('returns Comp AI defaults when no overrides are provided', () => {
    expect(getAppBranding({})).toEqual({
      appName: 'Comp AI',
      appDescription: 'Automate SOC 2, ISO 27001 and GDPR compliance with AI.',
      appUrl: 'https://app.trycomp.ai',
      ogImageUrl: 'https://cdn.trycomp.ai/opengraph-image.jpg',
      termsUrl: undefined,
      privacyUrl: undefined,
    });
    expect(shouldShowDefaultBrandLogo('Comp AI')).toBe(true);
  });

  it('supports custom branding values and generic initials', () => {
    expect(
      getAppBranding({
        NEXT_PUBLIC_APP_NAME: 'Lattix Platform',
        NEXT_PUBLIC_APP_DESCRIPTION: 'Internal governance workspace',
        NEXT_PUBLIC_APP_URL: 'https://app.lattix.example',
        NEXT_PUBLIC_APP_OG_IMAGE_URL: 'https://assets.example.com/og.png',
        NEXT_PUBLIC_TERMS_URL: 'https://intranet.example.com/terms',
        NEXT_PUBLIC_PRIVACY_URL: 'https://intranet.example.com/privacy',
      }),
    ).toEqual({
      appName: 'Lattix Platform',
      appDescription: 'Internal governance workspace',
      appUrl: 'https://app.lattix.example',
      ogImageUrl: 'https://assets.example.com/og.png',
      termsUrl: 'https://intranet.example.com/terms',
      privacyUrl: 'https://intranet.example.com/privacy',
    });
    expect(getBrandInitials('Lattix Platform')).toBe('LP');
    expect(shouldShowDefaultBrandLogo('Lattix Platform')).toBe(false);
  });

  it('hides non-enforced providers and magic links in Entra-only mode', () => {
    expect(
      getVisibleAuthOptions({
        AUTH_ENFORCED_PROVIDER: 'microsoft',
        AUTH_GOOGLE_ID: 'google-id',
        AUTH_GOOGLE_SECRET: 'google-secret',
        AUTH_GITHUB_ID: 'github-id',
        AUTH_GITHUB_SECRET: 'github-secret',
        AUTH_MICROSOFT_CLIENT_ID: 'microsoft-id',
        AUTH_MICROSOFT_CLIENT_SECRET: 'microsoft-secret',
      }),
    ).toEqual({
      showGoogle: false,
      showGithub: false,
      showMicrosoft: true,
      allowMagicLink: false,
    });
  });
});
