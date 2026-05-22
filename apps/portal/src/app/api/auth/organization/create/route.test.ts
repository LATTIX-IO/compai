import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';

import { PORTAL_SESSION_COOKIE_NAME } from '@/app/lib/portal-session';

const buildPortalAuthHeadersMock = mock(() => ({
  Authorization: 'Bearer ses_portal_123',
  origin: 'https://compai-api.vercel.app',
}));

mock.module('@/app/lib/portal-session', () => ({
  PORTAL_SESSION_COOKIE_NAME,
  buildPortalAuthHeaders: buildPortalAuthHeadersMock,
}));

mock.module('@/env.mjs', () => ({
  env: {
    BACKEND_API_URL: 'https://compai-api.vercel.app',
    NEXT_PUBLIC_API_URL: 'https://compai-api.vercel.app',
  },
}));

const { POST } = await import('./route');

function createRequest(body: unknown): NextRequest {
  return new NextRequest('https://compai-lattix.vercel.app/api/auth/organization/create', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      cookie: `${PORTAL_SESSION_COOKIE_NAME}=ses_portal_123`,
      'x-request-id': 'req_123',
    },
  });
}

describe('POST /api/auth/organization/create', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    buildPortalAuthHeadersMock.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('proxies the organization create request with portal auth headers', async () => {
    const upstreamResponse = new Response(
      JSON.stringify({
        id: 'org_internal_123',
        name: 'Lattix Internal',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'better-auth.session_token=abc; Path=/; HttpOnly',
        },
      },
    );

    const fetchMock = mock(async () => upstreamResponse);
    globalThis.fetch = fetchMock as typeof fetch;

    const request = createRequest({
      name: 'Lattix Internal',
      slug: 'lattix-internal',
    });
    const response = await POST(request);

    expect(buildPortalAuthHeadersMock).toHaveBeenCalledWith({
      headers: request.headers,
      apiUrl: 'https://compai-api.vercel.app',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://compai-api.vercel.app/api/auth/organization/create',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ses_portal_123',
          origin: 'https://compai-api.vercel.app',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Lattix Internal',
          slug: 'lattix-internal',
        }),
        redirect: 'manual',
      },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Set-Cookie')).toContain('better-auth.session_token=abc');
    await expect(response.json()).resolves.toEqual({
      id: 'org_internal_123',
      name: 'Lattix Internal',
    });
  });
});