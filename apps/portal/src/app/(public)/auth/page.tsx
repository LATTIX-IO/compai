import {
  getBrandInitials,
  getPortalAuthDescription,
  getPortalBranding,
  getVisiblePortalAuthOptions,
  hasVisiblePortalAuthOptions,
  shouldShowDefaultBrandLogo,
} from '@/app/lib/platform-deployment';
import { auth } from '@/app/lib/auth';
import { env } from '@/env.mjs';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthPageClient } from './auth-page-client';

const branding = getPortalBranding(env);

export const metadata: Metadata = {
  title: `Sign in | ${branding.appName}`,
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const isDeviceAuth = params.device_auth === 'true';
  const callbackPort = typeof params.callback_port === 'string' ? params.callback_port : undefined;
  const state = typeof params.state === 'string' ? params.state : undefined;

  const deviceAuthRedirect =
    isDeviceAuth && callbackPort && state
      ? `/auth/device-callback?callback_port=${encodeURIComponent(callbackPort)}&state=${encodeURIComponent(state)}`
      : undefined;

  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    redirect(deviceAuthRedirect ?? '/');
  }

  const authOptions = getVisiblePortalAuthOptions(env);
  const portalDescription = getPortalAuthDescription({
    appName: branding.appName,
    authOptions,
  });
  const showBrandLogo = shouldShowDefaultBrandLogo(branding.appName);
  const hasVisibleAuthOptions = hasVisiblePortalAuthOptions(authOptions);
  const hasLegalLinks = Boolean(branding.termsUrl || branding.privacyUrl);

  return (
    <AuthPageClient
      appName={branding.appName}
      termsUrl={branding.termsUrl}
      privacyUrl={branding.privacyUrl}
      portalDescription={portalDescription}
      allowOtp={authOptions.allowOtp}
      showGoogle={authOptions.showGoogle}
      showMicrosoft={authOptions.showMicrosoft}
      showBrandLogo={showBrandLogo}
      brandInitials={getBrandInitials(branding.appName)}
      hasVisibleAuthOptions={hasVisibleAuthOptions}
      hasLegalLinks={hasLegalLinks}
      deviceAuthRedirect={deviceAuthRedirect}
    />
  );
}
