import {
  PORTAL_SESSION_COOKIE_NAME,
  isValidPortalSessionToken,
  normalizePortalRedirectPath,
  parsePortalSessionExpiry,
} from '@/app/lib/portal-session';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PortalSessionRequestBody = {
  sessionToken?: unknown;
  expiresAt?: unknown;
  next?: unknown;
};

type PortalSessionRequestMode = 'json' | 'redirect';

function getRequestBodyValue<T extends keyof PortalSessionRequestBody>(
  body: unknown,
  key: T,
): PortalSessionRequestBody[T] {
  if (!body || typeof body !== 'object' || !(key in body)) {
    return undefined;
  }

  return (body as PortalSessionRequestBody)[key];
}

function withCookieDefaults(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

async function parsePortalSessionRequest(
  request: NextRequest,
): Promise<{ body: PortalSessionRequestBody; mode: PortalSessionRequestMode }> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return {
      body: (await request.json()) as PortalSessionRequestBody,
      mode: 'json',
    };
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.formData();

    return {
      body: {
        sessionToken: formData.get('sessionToken'),
        expiresAt: formData.get('expiresAt'),
        next: formData.get('next'),
      },
      mode: 'redirect',
    };
  }

  throw new Error('Unsupported content type.');
}

function buildPortalSessionSuccessResponse(options: {
  request: NextRequest;
  mode: PortalSessionRequestMode;
  nextPath: string;
}): NextResponse {
  if (options.mode === 'redirect') {
    return withCookieDefaults(
      NextResponse.redirect(new URL(options.nextPath, options.request.url), 303),
    );
  }

  return withCookieDefaults(NextResponse.json({ success: true }));
}

function buildPortalSessionErrorResponse(options: {
  request: NextRequest;
  mode: PortalSessionRequestMode;
  message: string;
  status: number;
}): NextResponse {
  if (options.mode === 'redirect') {
    return withCookieDefaults(
      NextResponse.redirect(new URL('/auth', options.request.url), 303),
    );
  }

  return withCookieDefaults(
    NextResponse.json({ error: options.message }, { status: options.status }),
  );
}

export async function POST(request: NextRequest): Promise<Response> {
  let parsedRequest:
    | {
        body: PortalSessionRequestBody;
        mode: PortalSessionRequestMode;
      }
    | undefined;

  try {
    parsedRequest = await parsePortalSessionRequest(request);
  } catch {
    return buildPortalSessionErrorResponse({
      request,
      mode: 'json',
      message: 'Invalid request body.',
      status: 400,
    });
  }

  const sessionToken = getRequestBodyValue(parsedRequest.body, 'sessionToken');
  if (!isValidPortalSessionToken(sessionToken)) {
    return buildPortalSessionErrorResponse({
      request,
      mode: parsedRequest.mode,
      message: 'Invalid session token.',
      status: 400,
    });
  }

  const expiresAt = parsePortalSessionExpiry(
    getRequestBodyValue(parsedRequest.body, 'expiresAt'),
  );
  const nextValue = getRequestBodyValue(parsedRequest.body, 'next');
  const nextPath =
    normalizePortalRedirectPath(typeof nextValue === 'string' ? nextValue : undefined) ?? '/';

  const response = buildPortalSessionSuccessResponse({
    request,
    mode: parsedRequest.mode,
    nextPath,
  });
  response.cookies.set(PORTAL_SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(expiresAt ? { expires: expiresAt } : {}),
  });

  return response;
}

export async function DELETE(): Promise<Response> {
  const response = withCookieDefaults(NextResponse.json({ success: true }));
  response.cookies.set(PORTAL_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}