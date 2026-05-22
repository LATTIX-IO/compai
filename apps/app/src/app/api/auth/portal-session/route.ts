import {
  APP_SESSION_COOKIE_NAME,
  isValidAppSessionToken,
  normalizeAppRedirectPath,
  parseAppSessionExpiry,
} from '@/lib/app-session';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AppSessionRequestBody = {
  sessionToken?: unknown;
  expiresAt?: unknown;
  next?: unknown;
};

type AppSessionRequestMode = 'json' | 'redirect';

function getRequestBodyValue<T extends keyof AppSessionRequestBody>(
  body: unknown,
  key: T,
): AppSessionRequestBody[T] {
  if (!body || typeof body !== 'object' || !(key in body)) {
    return undefined;
  }

  return (body as AppSessionRequestBody)[key];
}

function withCookieDefaults(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

async function parseAppSessionRequest(
  request: NextRequest,
): Promise<{ body: AppSessionRequestBody; mode: AppSessionRequestMode }> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return {
      body: (await request.json()) as AppSessionRequestBody,
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

function buildAppSessionSuccessResponse(options: {
  request: NextRequest;
  mode: AppSessionRequestMode;
  nextPath: string;
}): NextResponse {
  if (options.mode === 'redirect') {
    return withCookieDefaults(
      NextResponse.redirect(new URL(options.nextPath, options.request.url), 303),
    );
  }

  return withCookieDefaults(NextResponse.json({ success: true }));
}

function buildAppSessionErrorResponse(options: {
  request: NextRequest;
  mode: AppSessionRequestMode;
  message: string;
  status: number;
}): NextResponse {
  if (options.mode === 'redirect') {
    return withCookieDefaults(NextResponse.redirect(new URL('/auth', options.request.url), 303));
  }

  return withCookieDefaults(
    NextResponse.json({ error: options.message }, { status: options.status }),
  );
}

export async function POST(request: NextRequest): Promise<Response> {
  let parsedRequest:
    | {
        body: AppSessionRequestBody;
        mode: AppSessionRequestMode;
      }
    | undefined;

  try {
    parsedRequest = await parseAppSessionRequest(request);
  } catch {
    return buildAppSessionErrorResponse({
      request,
      mode: 'json',
      message: 'Invalid request body.',
      status: 400,
    });
  }

  const sessionToken = getRequestBodyValue(parsedRequest.body, 'sessionToken');
  if (!isValidAppSessionToken(sessionToken)) {
    return buildAppSessionErrorResponse({
      request,
      mode: parsedRequest.mode,
      message: 'Invalid session token.',
      status: 400,
    });
  }

  const expiresAt = parseAppSessionExpiry(getRequestBodyValue(parsedRequest.body, 'expiresAt'));
  const nextValue = getRequestBodyValue(parsedRequest.body, 'next');
  const nextPath =
    normalizeAppRedirectPath(typeof nextValue === 'string' ? nextValue : undefined) ?? '/';

  const response = buildAppSessionSuccessResponse({
    request,
    mode: parsedRequest.mode,
    nextPath,
  });
  response.cookies.set(APP_SESSION_COOKIE_NAME, sessionToken, {
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
  response.cookies.set(APP_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}