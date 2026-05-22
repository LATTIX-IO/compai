import { APP_SESSION_COOKIE_NAME } from '@/lib/app-session';
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { POST } from './route';

function createJsonRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/portal-session', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function createFormRequest(body: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/portal-session', {
    method: 'POST',
    body: new URLSearchParams(body),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

describe('POST /api/auth/portal-session', () => {
  it('stores the bridged app session token for JSON requests', async () => {
    const response = await POST(
      createJsonRequest({
        sessionToken: 'ses_123',
        expiresAt: '2025-01-01T00:00:00.000Z',
      }),
    );
    const data = await response.json();
    const setCookieHeader = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(setCookieHeader).toContain(`${APP_SESSION_COOKIE_NAME}=ses_123`);
  });

  it('redirects form posts to the requested next path', async () => {
    const response = await POST(
      createFormRequest({
        sessionToken: 'ses_123',
        expiresAt: '2025-01-01T00:00:00.000Z',
        next: '/org_123/overview',
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('http://localhost:3000/org_123/overview');
  });

  it('rejects invalid session tokens', async () => {
    const response = await POST(createJsonRequest({ sessionToken: '' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid session token.');
  });
});
