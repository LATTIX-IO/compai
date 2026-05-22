import { buildPortalAuthHeaders } from '@/app/lib/portal-session';
import { env } from '@/env.mjs';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE =
  env.BACKEND_API_URL || env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function POST(req: NextRequest): Promise<Response> {
  const headers = buildPortalAuthHeaders({
    headers: req.headers,
    apiUrl: API_BASE,
  });

  const response = await fetch(`${API_BASE}/api/auth/organization/create`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: await req.text(),
    redirect: 'manual',
  });

  const responseHeaders = new Headers();
  const contentType = response.headers.get('Content-Type');
  if (contentType) {
    responseHeaders.set('Content-Type', contentType);
  }

  for (const cookie of response.headers.getSetCookie()) {
    responseHeaders.append('Set-Cookie', cookie);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}