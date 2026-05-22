import {
  APP_SESSION_COOKIE_NAME,
  buildBridgedAuthCallbackUrl,
  getAppSessionTokenFromCookieHeader,
  normalizeAppRedirectPath,
  parseAppSessionExpiry,
  removeCookieFromHeader,
} from '@/lib/app-session';
import { describe, expect, it } from 'vitest';

describe('app session helpers', () => {
  it('extracts the app bearer token from a cookie header', () => {
    expect(
      getAppSessionTokenFromCookieHeader(
        `theme=dark; ${APP_SESSION_COOKIE_NAME}=ses_123; locale=en`,
      ),
    ).toBe('ses_123');
  });

  it('removes the app bridge cookie before forwarding cookies upstream', () => {
    expect(
      removeCookieFromHeader(
        `theme=dark; ${APP_SESSION_COOKIE_NAME}=ses_123; locale=en`,
        APP_SESSION_COOKIE_NAME,
      ),
    ).toBe('theme=dark; locale=en');
  });

  it('routes sign-ins through the API bridge and preserves redirect targets', () => {
    expect(
      buildBridgedAuthCallbackUrl({
        apiBaseUrl: 'https://compai-api.vercel.app',
        appOrigin: 'https://compai-lattix.vercel.app',
        redirectTo: '/org_123/overview?tab=tasks',
      }),
    ).toBe(
      'https://compai-api.vercel.app/v1/auth/portal-bridge?portal_origin=https%3A%2F%2Fcompai-lattix.vercel.app&next=%2Forg_123%2Foverview%3Ftab%3Dtasks',
    );
  });

  it('prioritizes invite redirects over other redirect targets', () => {
    expect(
      buildBridgedAuthCallbackUrl({
        apiBaseUrl: 'https://compai-api.vercel.app',
        appOrigin: 'https://compai-lattix.vercel.app',
        inviteCode: 'invite_123',
        redirectTo: '/org_123/overview',
      }),
    ).toBe(
      'https://compai-api.vercel.app/v1/auth/portal-bridge?portal_origin=https%3A%2F%2Fcompai-lattix.vercel.app&next=%2Finvite%2Finvite_123',
    );
  });

  it('rejects external redirect targets', () => {
    expect(normalizeAppRedirectPath('https://example.com')).toBeUndefined();
    expect(normalizeAppRedirectPath('//example.com')).toBeUndefined();
    expect(normalizeAppRedirectPath('/safe')).toBe('/safe');
  });

  it('parses valid expiry timestamps and rejects invalid values', () => {
    expect(parseAppSessionExpiry('2025-01-01T00:00:00.000Z')?.toISOString()).toBe(
      '2025-01-01T00:00:00.000Z',
    );
    expect(parseAppSessionExpiry('not-a-date')).toBeUndefined();
  });
});