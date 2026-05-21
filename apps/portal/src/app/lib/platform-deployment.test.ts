import { describe, expect, it } from 'bun:test';
import {
  getBrandInitials,
  getPortalAuthDescription,
  getPortalBranding,
  getVisiblePortalAuthOptions,
  hasVisiblePortalAuthOptions,
  shouldShowDefaultBrandLogo,
} from './platform-deployment';

describe('portal platform deployment helpers', () => {
  it('returns neutral defaults when no overrides are provided', () => {
    const branding = getPortalBranding({});
    const authOptions = getVisiblePortalAuthOptions({});

    expect(branding).toEqual({
      appName: 'Comp AI',
      appDescription:
        'Secure employee, contractor, and teammate access for your organization.',
      termsUrl: undefined,
      privacyUrl: undefined,
    });
    expect(authOptions).toEqual({
      showGoogle: false,
      showMicrosoft: false,
      allowOtp: true,
    });
    expect(
      getPortalAuthDescription({ appName: branding.appName, authOptions }),
    ).toBe('Enter your email address to receive a one-time password.');
    expect(shouldShowDefaultBrandLogo(branding.appName)).toBe(true);
  });

  it('hides OTP and non-enforced providers in Entra-only mode', () => {
    const authOptions = getVisiblePortalAuthOptions({
      AUTH_ENFORCED_PROVIDER: 'microsoft',
      AUTH_GOOGLE_ID: 'google-id',
      AUTH_GOOGLE_SECRET: 'google-secret',
      AUTH_MICROSOFT_CLIENT_ID: 'microsoft-id',
      AUTH_MICROSOFT_CLIENT_SECRET: 'microsoft-secret',
    });

    expect(authOptions).toEqual({
      showGoogle: false,
      showMicrosoft: true,
      allowOtp: false,
    });
    expect(
      getPortalAuthDescription({ appName: 'Lattix Platform', authOptions }),
    ).toBe(
      'Continue with your Microsoft work account to access Lattix Platform.',
    );
    expect(hasVisiblePortalAuthOptions(authOptions)).toBe(true);
  });

  it('supports custom branding and detects fully unconfigured auth states', () => {
    const branding = getPortalBranding({
      NEXT_PUBLIC_APP_NAME: 'Lattix Platform',
      NEXT_PUBLIC_APP_DESCRIPTION: 'Internal governance workspace',
      NEXT_PUBLIC_TERMS_URL: 'https://intranet.example.com/terms',
      NEXT_PUBLIC_PRIVACY_URL: 'https://intranet.example.com/privacy',
    });
    const authOptions = getVisiblePortalAuthOptions({
      AUTH_ENFORCED_PROVIDER: 'microsoft',
    });

    expect(branding).toEqual({
      appName: 'Lattix Platform',
      appDescription: 'Internal governance workspace',
      termsUrl: 'https://intranet.example.com/terms',
      privacyUrl: 'https://intranet.example.com/privacy',
    });
    expect(authOptions).toEqual({
      showGoogle: false,
      showMicrosoft: false,
      allowOtp: false,
    });
    expect(hasVisiblePortalAuthOptions(authOptions)).toBe(false);
    expect(
      getPortalAuthDescription({ appName: branding.appName, authOptions }),
    ).toBe('No sign-in methods are currently configured for Lattix Platform.');
    expect(getBrandInitials(branding.appName)).toBe('LP');
    expect(shouldShowDefaultBrandLogo(branding.appName)).toBe(false);
  });
});
