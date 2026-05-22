import { describe, expect, it } from 'bun:test';

import {
  PORTAL_SESSION_COOKIE_NAME,
  buildPortalAuthHeaders,
  buildSocialSignInCallbackUrl,
  getPortalSessionTokenFromCookieHeader,
  normalizePortalRedirectPath,
  parsePortalSessionExpiry,
  removeCookieFromHeader,
} from './portal-session';

describe('portal session helpers', () => {
  it('extracts the portal bearer token from a cookie header', () => {
    expect(
      getPortalSessionTokenFromCookieHeader(
        `theme=dark; ${PORTAL_SESSION_COOKIE_NAME}=ses_123; locale=en`,
      ),
    ).toBe('ses_123');
  });

  it('removes the portal bridge cookie before forwarding cookies upstream', () => {
    expect(
      removeCookieFromHeader(
        `theme=dark; ${PORTAL_SESSION_COOKIE_NAME}=ses_123; locale=en`,
        PORTAL_SESSION_COOKIE_NAME,
      ),
    ).toBe('theme=dark; locale=en');
  });

  it('builds upstream auth headers with bearer auth and origin fallback', () => {
    const headers = new Headers({
      cookie: `theme=dark; ${PORTAL_SESSION_COOKIE_NAME}=ses_123`,
      'x-request-id': 'req_1',
    });

    expect(
      buildPortalAuthHeaders({
        headers,
        apiUrl: 'https://compai-api.vercel.app',
      }),
    ).toEqual({
      Authorization: 'Bearer ses_123',
      origin: 'https://compai-api.vercel.app',
      'x-request-id': 'req_1',
      cookie: 'theme=dark',
    });
  });

  it('preserves an explicit authorization header', () => {
    const headers = new Headers({
      authorization: 'Bearer explicit',
      cookie: `${PORTAL_SESSION_COOKIE_NAME}=ses_123`,
    });

    expect(
      buildPortalAuthHeaders({
        headers,
        apiUrl: 'https://compai-api.vercel.app',
      }).authorization,
    ).toBe('Bearer explicit');
  });

  it('sends device auth flows directly to the device callback page', () => {
    const searchParams = new URLSearchParams({
      device_auth: 'true',
      callback_port: '3003',
      state: 'abc',
    });

    expect(
      buildSocialSignInCallbackUrl({
        apiBaseUrl: 'https://compai-api.vercel.app',
        portalOrigin: 'https://compai-lattix.vercel.app',
        searchParams,
      }),
    ).toBe(
      'https://compai-lattix.vercel.app/auth/device-callback?device_auth=true&callback_port=3003&state=abc',
    );
  });

  it('routes normal social sign-ins through the auth completion page', () => {
    const searchParams = new URLSearchParams({ invite: 'abc' });

    expect(
      buildSocialSignInCallbackUrl({
        apiBaseUrl: 'https://compai-api.vercel.app',
        portalOrigin: 'https://compai-lattix.vercel.app',
        searchParams,
      }),
    ).toBe(
      'https://compai-api.vercel.app/v1/auth/portal-bridge?portal_origin=https%3A%2F%2Fcompai-lattix.vercel.app&next=%2F%3Finvite%3Dabc',
    );
  });

  it('rejects external redirect targets', () => {
    expect(normalizePortalRedirectPath('https://example.com')).toBeUndefined();
    expect(normalizePortalRedirectPath('//example.com')).toBeUndefined();
    expect(normalizePortalRedirectPath('/safe')).toBe('/safe');
  });

  it('parses valid expiry timestamps and rejects invalid values', () => {
    expect(parsePortalSessionExpiry('2025-01-01T00:00:00.000Z')?.toISOString()).toBe(
      '2025-01-01T00:00:00.000Z',
    );
    expect(parsePortalSessionExpiry('not-a-date')).toBeUndefined();
  });
});
