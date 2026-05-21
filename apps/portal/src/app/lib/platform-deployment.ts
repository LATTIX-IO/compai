const DEFAULT_APP_NAME = 'Comp AI';
const DEFAULT_PORTAL_DESCRIPTION =
  'Secure employee, contractor, and teammate access for your organization.';

const AUTH_PROVIDERS = ['google', 'github', 'microsoft'] as const;

type AuthProvider = (typeof AUTH_PROVIDERS)[number];
type EnvLike = Partial<Record<string, string | undefined>>;

export interface VisiblePortalAuthOptions {
  showGoogle: boolean;
  showMicrosoft: boolean;
  allowOtp: boolean;
}

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

export function getPortalBranding(env: EnvLike) {
  return {
    appName: trimToUndefined(env.NEXT_PUBLIC_APP_NAME) ?? DEFAULT_APP_NAME,
    appDescription:
      trimToUndefined(env.NEXT_PUBLIC_APP_DESCRIPTION) ??
      DEFAULT_PORTAL_DESCRIPTION,
    termsUrl: trimToUndefined(env.NEXT_PUBLIC_TERMS_URL),
    privacyUrl: trimToUndefined(env.NEXT_PUBLIC_PRIVACY_URL),
  };
}

export function getVisiblePortalAuthOptions(
  env: EnvLike,
): VisiblePortalAuthOptions {
  const enforcedProvider = getEnforcedProvider(env);

  return {
    showGoogle:
      Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) &&
      (!enforcedProvider || enforcedProvider === 'google'),
    showMicrosoft:
      Boolean(
        env.AUTH_MICROSOFT_CLIENT_ID && env.AUTH_MICROSOFT_CLIENT_SECRET,
      ) && (!enforcedProvider || enforcedProvider === 'microsoft'),
    allowOtp: !enforcedProvider,
  };
}

export function hasVisiblePortalAuthOptions(
  authOptions: VisiblePortalAuthOptions,
): boolean {
  return authOptions.allowOtp || authOptions.showGoogle || authOptions.showMicrosoft;
}

export function getPortalAuthDescription({
  appName,
  authOptions,
}: {
  appName: string;
  authOptions: VisiblePortalAuthOptions;
}): string {
  if (authOptions.allowOtp) {
    if (authOptions.showGoogle || authOptions.showMicrosoft) {
      return `Use your work email or organization sign-in to access ${appName}.`;
    }

    return 'Enter your email address to receive a one-time password.';
  }

  if (authOptions.showMicrosoft) {
    return `Continue with your Microsoft work account to access ${appName}.`;
  }

  if (authOptions.showGoogle) {
    return `Continue with your Google work account to access ${appName}.`;
  }

  return `No sign-in methods are currently configured for ${appName}.`;
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
