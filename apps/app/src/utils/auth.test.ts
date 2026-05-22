import { APP_SESSION_COOKIE_NAME, buildAppAuthHeaders } from '@/lib/app-session';
import { describe, expect, it } from 'vitest';

const API_URL = 'https://compai-api.vercel.app';

describe('buildAppAuthHeaders', () => {
  it('forwards a normal cookie header unchanged when no app session cookie exists', () => {
    const headers = new Headers({ cookie: 'session=abc123' });

    expect(buildAppAuthHeaders({ headers, apiUrl: API_URL })).toEqual({
      cookie: 'session=abc123',
      origin: API_URL,
    });
  });

  it('converts the app session cookie into bearer auth and strips it from forwarded cookies', () => {
    const headers = new Headers({
      cookie: `theme=dark; ${APP_SESSION_COOKIE_NAME}=ses_123; locale=en`,
      'x-request-id': 'req_123',
    });

    expect(buildAppAuthHeaders({ headers, apiUrl: API_URL })).toEqual({
      Authorization: 'Bearer ses_123',
      cookie: 'theme=dark; locale=en',
      origin: API_URL,
      'x-request-id': 'req_123',
    });
  });

  it('preserves explicit authorization headers', () => {
    const headers = new Headers({
      authorization: 'Bearer explicit',
      cookie: `${APP_SESSION_COOKIE_NAME}=ses_123`,
    });

    expect(buildAppAuthHeaders({ headers, apiUrl: API_URL }).authorization).toBe(
      'Bearer explicit',
    );
  });

  it('preserves an explicit origin header', () => {
    const headers = new Headers({ origin: 'https://compai-lattix.vercel.app' });

    expect(buildAppAuthHeaders({ headers, apiUrl: API_URL }).origin).toBe(
      'https://compai-lattix.vercel.app',
    );
  });
});
