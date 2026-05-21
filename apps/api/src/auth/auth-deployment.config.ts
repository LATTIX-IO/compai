type EnvLike = Partial<Record<string, string | undefined>>;

export const SUPPORTED_AUTH_PROVIDERS = [
  'google',
  'github',
  'microsoft',
] as const;

export type SupportedAuthProvider =
  (typeof SUPPORTED_AUTH_PROVIDERS)[number];

const DEFAULT_TRUSTED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3333',
  'http://localhost:3004',
  'http://localhost:3008',
  'https://app.trycomp.ai',
  'https://portal.trycomp.ai',
  'https://api.trycomp.ai',
  'https://app.staging.trycomp.ai',
  'https://portal.staging.trycomp.ai',
  'https://api.staging.trycomp.ai',
  'https://dev.trycomp.ai',
  'https://framework-editor.trycomp.ai',
] as const;

export const OPEN_MICROSOFT_TENANT_IDS = new Set([
  'common',
  'organizations',
  'consumers',
]);

const DEFAULT_APP_NAME = 'Comp AI';

function trimToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function splitCsv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function getAuthDisplayName(env: EnvLike = process.env): string {
  return trimToUndefined(env.NEXT_PUBLIC_APP_NAME) ?? DEFAULT_APP_NAME;
}

export function getEnforcedAuthProvider(
  env: EnvLike = process.env,
): SupportedAuthProvider | undefined {
  const configuredProvider = trimToUndefined(env.AUTH_ENFORCED_PROVIDER);

  if (!configuredProvider) {
    return undefined;
  }

  const matchedProvider = SUPPORTED_AUTH_PROVIDERS.find(
    (provider) => provider === configuredProvider,
  );

  if (!matchedProvider) {
    throw new Error(
      `AUTH_ENFORCED_PROVIDER must be one of: ${SUPPORTED_AUTH_PROVIDERS.join(', ')}`,
    );
  }

  return matchedProvider;
}

export function getCookieDomain(env: EnvLike = process.env): string | undefined {
  const configuredCookieDomain = trimToUndefined(env.AUTH_COOKIE_DOMAIN);

  if (configuredCookieDomain) {
    return configuredCookieDomain;
  }

  const baseUrl = env.BASE_URL ?? '';

  if (baseUrl.includes('staging.trycomp.ai')) {
    return '.staging.trycomp.ai';
  }

  if (baseUrl.includes('trycomp.ai')) {
    return '.trycomp.ai';
  }

  return undefined;
}

export function getTrustedOrigins(env: EnvLike = process.env): string[] {
  const configuredOrigins = splitCsv(env.AUTH_TRUSTED_ORIGINS);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return [...DEFAULT_TRUSTED_ORIGINS];
}

export function originMatchesPattern(origin: string, pattern: string): boolean {
  if (origin === pattern) {
    return true;
  }

  const wildcardMatch = pattern.match(/^(https?):\/\/\*\.(.+?)(?::(\d+))?$/i);

  if (!wildcardMatch) {
    return false;
  }

  try {
    const url = new URL(origin);
    const [, protocol, hostnameSuffix, port] = wildcardMatch;

    if (url.protocol !== `${protocol}:`) {
      return false;
    }

    if ((port ?? '') !== url.port) {
      return false;
    }

    return url.hostname.endsWith(`.${hostnameSuffix}`);
  } catch {
    return false;
  }
}

export function isStaticTrustedOrigin(
  origin: string,
  env: EnvLike = process.env,
): boolean {
  const trustedOrigins = getTrustedOrigins(env);

  if (trustedOrigins.some((pattern) => originMatchesPattern(origin, pattern))) {
    return true;
  }

  if (trimToUndefined(env.AUTH_TRUSTED_ORIGINS)) {
    return false;
  }

  try {
    const url = new URL(origin);

    return (
      url.hostname.endsWith('.trycomp.ai') ||
      url.hostname.endsWith('.staging.trycomp.ai') ||
      url.hostname.endsWith('.trust.inc') ||
      url.hostname === 'trust.inc'
    );
  } catch {
    return false;
  }
}

export function buildSocialProviders(
  env: EnvLike = process.env,
): Record<string, unknown> {
  const enforcedProvider = getEnforcedAuthProvider(env);
  const providers: Record<string, unknown> = {};

  if (
    env.AUTH_GOOGLE_ID &&
    env.AUTH_GOOGLE_SECRET &&
    (!enforcedProvider || enforcedProvider === 'google')
  ) {
    providers.google = {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    };
  }

  if (
    env.AUTH_GITHUB_ID &&
    env.AUTH_GITHUB_SECRET &&
    (!enforcedProvider || enforcedProvider === 'github')
  ) {
    providers.github = {
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    };
  }

  if (
    env.AUTH_MICROSOFT_CLIENT_ID &&
    env.AUTH_MICROSOFT_CLIENT_SECRET &&
    (!enforcedProvider || enforcedProvider === 'microsoft')
  ) {
    providers.microsoft = {
      clientId: env.AUTH_MICROSOFT_CLIENT_ID,
      clientSecret: env.AUTH_MICROSOFT_CLIENT_SECRET,
      tenantId: trimToUndefined(env.AUTH_MICROSOFT_TENANT_ID) ?? 'common',
      prompt: 'select_account',
    };
  }

  return providers;
}

export function shouldEnableEmailAndPassword(
  env: EnvLike = process.env,
): boolean {
  return !getEnforcedAuthProvider(env);
}

export function shouldEnableMagicLink(env: EnvLike = process.env): boolean {
  return !getEnforcedAuthProvider(env);
}

export function shouldEnableEmailOtp(env: EnvLike = process.env): boolean {
  return !getEnforcedAuthProvider(env);
}

export function getTrustedProviderNames(
  env: EnvLike = process.env,
): SupportedAuthProvider[] {
  const providers = buildSocialProviders(env);

  return SUPPORTED_AUTH_PROVIDERS.filter((provider) => Boolean(providers[provider]));
}

export function validateAuthRuntimeConfig(env: EnvLike = process.env): void {
  const enforcedProvider = getEnforcedAuthProvider(env);

  if (!enforcedProvider) {
    return;
  }

  if (enforcedProvider === 'google') {
    if (!env.AUTH_GOOGLE_ID || !env.AUTH_GOOGLE_SECRET) {
      throw new Error(
        'AUTH_ENFORCED_PROVIDER=google requires AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET.',
      );
    }

    return;
  }

  if (enforcedProvider === 'github') {
    if (!env.AUTH_GITHUB_ID || !env.AUTH_GITHUB_SECRET) {
      throw new Error(
        'AUTH_ENFORCED_PROVIDER=github requires AUTH_GITHUB_ID and AUTH_GITHUB_SECRET.',
      );
    }

    return;
  }

  if (!env.AUTH_MICROSOFT_CLIENT_ID || !env.AUTH_MICROSOFT_CLIENT_SECRET) {
    throw new Error(
      'AUTH_ENFORCED_PROVIDER=microsoft requires AUTH_MICROSOFT_CLIENT_ID and AUTH_MICROSOFT_CLIENT_SECRET.',
    );
  }

  const tenantId = trimToUndefined(env.AUTH_MICROSOFT_TENANT_ID)?.toLowerCase();

  if (!tenantId || OPEN_MICROSOFT_TENANT_IDS.has(tenantId)) {
    throw new Error(
      'AUTH_ENFORCED_PROVIDER=microsoft requires AUTH_MICROSOFT_TENANT_ID to be set to a specific Entra tenant ID.',
    );
  }
}
