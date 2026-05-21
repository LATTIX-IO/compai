import { LoginForm } from '@/app/components/login-form';
import { OtpSignIn } from '@/app/components/otp';
import { env } from '@/env.mjs';
import {
  getBrandInitials,
  getPortalAuthDescription,
  getPortalBranding,
  getVisiblePortalAuthOptions,
  hasVisiblePortalAuthOptions,
  shouldShowDefaultBrandLogo,
} from '@/app/lib/platform-deployment';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  LogoIcon,
} from '@trycompai/design-system';
import type { Metadata } from 'next';
import Link from 'next/link';

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

  const authOptions = getVisiblePortalAuthOptions(env);
  const portalDescription = getPortalAuthDescription({
    appName: branding.appName,
    authOptions,
  });
  const showBrandLogo = shouldShowDefaultBrandLogo(branding.appName);
  const hasVisibleAuthOptions = hasVisiblePortalAuthOptions(authOptions);
  const hasLegalLinks = Boolean(branding.termsUrl || branding.privacyUrl);

  return (
    <div className="flex min-h-dvh flex-col text-foreground">
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Card>
            <CardHeader>
              <div className="space-y-3 pt-10 text-center">
                {showBrandLogo ? (
                  <div className="mx-auto flex h-10 w-10 items-center justify-center">
                    <LogoIcon width={40} height={40} aria-hidden="true" />
                  </div>
                ) : (
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                    {getBrandInitials(branding.appName)}
                  </div>
                )}
                <div className="text-2xl tracking-tight text-card-foreground">
                  <CardTitle>{`Sign in to ${branding.appName}`}</CardTitle>
                </div>
                <div className="px-4 text-base text-muted-foreground">
                  <CardDescription>{portalDescription}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pb-6">
                {authOptions.allowOtp ? (
                  <div className="flex flex-col space-y-2">
                    <OtpSignIn deviceAuthRedirect={deviceAuthRedirect} />
                  </div>
                ) : null}
                {!hasVisibleAuthOptions ? (
                  <div className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    No sign-in methods are currently configured. Contact your administrator to
                    finish the portal authentication setup.
                  </div>
                ) : null}
                <LoginForm
                  showGoogle={authOptions.showGoogle}
                  showMicrosoft={authOptions.showMicrosoft}
                />
              </div>
            </CardContent>
            {hasLegalLinks ? (
              <CardFooter>
                <p className="w-full px-2 pb-10 text-center text-xs text-muted-foreground">
                  By clicking continue, you acknowledge the{' '}
                  {branding.termsUrl ? (
                    <Link href={branding.termsUrl} className="underline hover:text-primary">
                      Terms and Conditions
                    </Link>
                  ) : null}
                  {branding.termsUrl && branding.privacyUrl ? ' and ' : ''}
                  {branding.privacyUrl ? (
                    <Link href={branding.privacyUrl} className="underline hover:text-primary">
                      Privacy Policy
                    </Link>
                  ) : null}
                  .
                </p>
              </CardFooter>
            ) : null}
          </Card>
        </div>
      </main>
    </div>
  );
}
