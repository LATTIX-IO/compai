import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

export const PORTAL_SESSION_COOKIE_NAME = 'portal_session_token';

const MAX_SESSION_TOKEN_LENGTH = 4096;
const DEV_PORTAL_BASE_URL = 'https://portal.local';

export function getPortalSessionTokenFromCookieHeader(
  cookieHeader: string | null | undefined,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const prefix = `${PORTAL_SESSION_COOKIE_NAME}=`;

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

export function buildPortalAuthHeaders(options: {
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
  const portalSessionToken = getPortalSessionTokenFromCookieHeader(incomingCookieHeader);
  const forwardedCookieHeader = removeCookieFromHeader(
    incomingCookieHeader,
    PORTAL_SESSION_COOKIE_NAME,
  );

  delete obj.cookie;
  delete obj.Cookie;

  if (forwardedCookieHeader) {
    obj.cookie = forwardedCookieHeader;
  }

  if (!obj.origin && !obj.Origin) {
    obj.origin = options.apiUrl;
  }

  if (portalSessionToken && !obj.authorization && !obj.Authorization) {
    obj.Authorization = `Bearer ${portalSessionToken}`;
  }

  return obj;
}

export function normalizePortalRedirectPath(
  value: string | null | undefined,
): string | undefined {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }

  return value;
}

export function appendSearchParamsToPath(
  path: string,
  searchParams?: URLSearchParams,
): string {
  const url = new URL(path, DEV_PORTAL_BASE_URL);

  searchParams?.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return `${url.pathname}${url.search}`;
}

export function buildSocialSignInCallbackUrl(options: {
  apiBaseUrl: string;
  portalOrigin: string;
  inviteCode?: string;
  searchParams?: URLSearchParams;
}): string {
  const isDeviceAuth = options.searchParams?.get('device_auth') === 'true';

  if (isDeviceAuth) {
    return new URL(
      appendSearchParamsToPath('/auth/device-callback', options.searchParams),
      options.portalOrigin,
    ).toString();
  }

  const nextPath = appendSearchParamsToPath(
    options.inviteCode ? `/invite/${options.inviteCode}` : '/',
    options.searchParams,
  );

  const callbackUrl = new URL('/v1/auth/portal-bridge', options.apiBaseUrl);
  callbackUrl.searchParams.set('portal_origin', options.portalOrigin);
  if (nextPath !== '/') {
    callbackUrl.searchParams.set('next', nextPath);
  }

  return callbackUrl.toString();
}

export function isValidPortalSessionToken(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_SESSION_TOKEN_LENGTH;
}

export function parsePortalSessionExpiry(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate;
}