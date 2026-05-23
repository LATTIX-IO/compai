import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalDatabaseUrl = process.env.DATABASE_URL;
const originalRevalidationSecret = process.env.REVALIDATION_SECRET;

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/revalidate/path', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

async function loadPost() {
  vi.resetModules();
  return (await import('./route')).POST;
}

describe('POST /api/revalidate/path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/comp';
  });

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }

    if (originalRevalidationSecret === undefined) {
      delete process.env.REVALIDATION_SECRET;
    } else {
      process.env.REVALIDATION_SECRET = originalRevalidationSecret;
    }
  });

  it('returns 503 when revalidation is not configured', async () => {
    delete process.env.REVALIDATION_SECRET;
    const POST = await loadPost();

    const response = await POST(
      createRequest({ path: '/org_123/dashboard', secret: 'anything' }),
    );
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({ message: 'Revalidation is not configured' });
    expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
  });

  it('returns 401 when the secret does not match', async () => {
    process.env.REVALIDATION_SECRET = 'expected-secret';
    const POST = await loadPost();

    const response = await POST(
      createRequest({ path: '/org_123/dashboard', secret: 'wrong-secret' }),
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ message: 'Invalid secret' });
    expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
  });

  it('revalidates the requested path when the secret matches', async () => {
    process.env.REVALIDATION_SECRET = 'expected-secret';
    const POST = await loadPost();

    const response = await POST(
      createRequest({
        path: '/org_123/dashboard',
        type: 'layout',
        secret: 'expected-secret',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ revalidated: true });
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(
      '/org_123/dashboard',
      'layout',
    );
  });
});
