const DEFAULT_APP_NAME = 'Comp AI';
const DEFAULT_APP_DESCRIPTION =
  'Automate SOC 2, ISO 27001 and GDPR compliance with AI.';
const DEFAULT_APP_URL = 'https://app.trycomp.ai';
const DEFAULT_APP_OG_IMAGE_URL = 'https://cdn.trycomp.ai/opengraph-image.jpg';

const AUTH_PROVIDERS = ['google', 'github', 'microsoft'] as const;

type AuthProvider = (typeof AUTH_PROVIDERS)[number];

type EnvLike = Partial<Record<string, string | undefined>>;

function trimToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getEnforcedProvider(env: EnvLike): AuthProvider | undefined {
  const configuredProvider = trimToUndefined(env.AUTH_ENFORCED_PROVIDER);

  if (!configuredProvider) {
    return undefined;
  }

  return AUTH_PROVIDERS.find((provider) => provider === configuredProvider);
}

export function getAppBranding(env: EnvLike) {
  const appName = trimToUndefined(env.NEXT_PUBLIC_APP_NAME) ?? DEFAULT_APP_NAME;
  const appDescription =
    trimToUndefined(env.NEXT_PUBLIC_APP_DESCRIPTION) ?? DEFAULT_APP_DESCRIPTION;
  const appUrl = trimToUndefined(env.NEXT_PUBLIC_APP_URL) ?? DEFAULT_APP_URL;
  const ogImageUrl =
    trimToUndefined(env.NEXT_PUBLIC_APP_OG_IMAGE_URL) ?? DEFAULT_APP_OG_IMAGE_URL;

  return {
    appName,
    appDescription,
    appUrl,
    ogImageUrl,
    termsUrl: trimToUndefined(env.NEXT_PUBLIC_TERMS_URL),
    privacyUrl: trimToUndefined(env.NEXT_PUBLIC_PRIVACY_URL),
  };
}

export function getVisibleAuthOptions(env: EnvLike) {
  const enforcedProvider = getEnforcedProvider(env);

  return {
    showGoogle:
      Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) &&
      (!enforcedProvider || enforcedProvider === 'google'),
    showGithub:
      Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) &&
      (!enforcedProvider || enforcedProvider === 'github'),
    showMicrosoft:
      Boolean(
        env.AUTH_MICROSOFT_CLIENT_ID && env.AUTH_MICROSOFT_CLIENT_SECRET,
      ) && (!enforcedProvider || enforcedProvider === 'microsoft'),
    allowMagicLink: !enforcedProvider,
  };
}

export function shouldShowDefaultBrandLogo(appName: string): boolean {
  return appName === DEFAULT_APP_NAME;
}

export function getBrandInitials(appName: string): string {
  const initials = appName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'AP';
}
