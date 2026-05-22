import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

export const APP_SESSION_COOKIE_NAME = 'app_session_token';

const MAX_SESSION_TOKEN_LENGTH = 4096;

export function getAppSessionTokenFromCookieHeader(
  cookieHeader: string | null | undefined,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const prefix = `${APP_SESSION_COOKIE_NAME}=`;

  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();

    if (!trimmed.startsWith(prefix)) {
      continue;
    }

    const value = trimmed.slice(prefix.length);
    if (!value) {
      return undefined;
    }

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return undefined;
}

export function removeCookieFromHeader(
  cookieHeader: string | null | undefined,
  cookieName: string,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const remainingCookies = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !part.startsWith(`${cookieName}=`));

  if (remainingCookies.length === 0) {
    return undefined;
  }

  return remainingCookies.join('; ');
}

export function buildAppAuthHeaders(options: {
  headers: ReadonlyHeaders | Headers;
  apiUrl: string;
}): Record<string, string> {
  const obj: Record<string, string> = {};

  options.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (
      normalizedKey === 'cookie' ||
      normalizedKey === 'origin' ||
      normalizedKey === 'authorization' ||
      normalizedKey.startsWith('x-')
    ) {
      obj[key] = value;
    }
  });

  const incomingCookieHeader = obj.cookie ?? obj.Cookie;
  const appSessionToken = getAppSessionTokenFromCookieHeader(incomingCookieHeader);
  const forwardedCookieHeader = removeCookieFromHeader(
    incomingCookieHeader,
    APP_SESSION_COOKIE_NAME,
  );

  delete obj.cookie;
  delete obj.Cookie;

  if (forwardedCookieHeader) {
    obj.cookie = forwardedCookieHeader;
  }

  if (!obj.origin && !obj.Origin) {
    obj.origin = options.apiUrl;
  }

  if (appSessionToken && !obj.authorization && !obj.Authorization) {
    obj.Authorization = `Bearer ${appSessionToken}`;
  }

  return obj;
}

export function normalizeAppRedirectPath(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }

  return value;
}

export function buildBridgedAuthCallbackUrl(options: {
  apiBaseUrl: string;
  appOrigin: string;
  inviteCode?: string;
  redirectTo?: string;
}): string {
  const nextPath = options.inviteCode
    ? `/invite/${options.inviteCode}`
    : (normalizeAppRedirectPath(options.redirectTo) ?? '/');

  const callbackUrl = new URL('/v1/auth/portal-bridge', options.apiBaseUrl);
  callbackUrl.searchParams.set('portal_origin', options.appOrigin);

  if (nextPath !== '/') {
    callbackUrl.searchParams.set('next', nextPath);
  }

  return callbackUrl.toString();
}

export function isValidAppSessionToken(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_SESSION_TOKEN_LENGTH;
}

export function parseAppSessionExpiry(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate;
}
