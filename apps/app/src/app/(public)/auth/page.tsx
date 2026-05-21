import { LoginForm } from '@/components/login-form';
import { env } from '@/env.mjs';
import {
  getAppBranding,
  getBrandInitials,
  getVisibleAuthOptions,
  shouldShowDefaultBrandLogo,
} from '@/lib/platform-deployment';
import { auth } from '@/utils/auth';
import { getSafeRedirectPath } from '@/utils/auth-callback';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@trycompai/ui/card';
import { Icons } from '@trycompai/ui/icons';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const branding = getAppBranding(env);

export const metadata: Metadata = {
  title: `Sign in | ${branding.appName}`,
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ inviteCode?: string; redirectTo?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { inviteCode, redirectTo } = await searchParams;
  const safeRedirectTo = getSafeRedirectPath(redirectTo);

  const orgId = session?.session?.activeOrganizationId;

  if (orgId && inviteCode) {
    redirect('/setup');
  }

  if (orgId && !inviteCode) {
    redirect('/');
  }

  const { showGoogle, showGithub, showMicrosoft, allowMagicLink } =
    getVisibleAuthOptions(env);
  const showBrandLogo = shouldShowDefaultBrandLogo(branding.appName);
  const hasLegalLinks = Boolean(branding.termsUrl || branding.privacyUrl);

  return (
    <div className="flex min-h-dvh flex-col text-foreground">
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center space-y-3 pt-10">
            {showBrandLogo ? (
              <Icons.Logo className="h-10 w-10 mx-auto" />
            ) : (
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                {getBrandInitials(branding.appName)}
              </div>
            )}
            <CardTitle className="text-2xl tracking-tight text-card-foreground">
              {`Sign in to ${branding.appName}`}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground px-4">
              {branding.appDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-6 px-8">
            <LoginForm
              inviteCode={inviteCode}
              redirectTo={safeRedirectTo}
              showGoogle={showGoogle}
              showGithub={showGithub}
              showMicrosoft={showMicrosoft}
              allowMagicLink={allowMagicLink}
            />
          </CardContent>
          {hasLegalLinks && (
            <CardFooter className="pb-10">
              <p className="w-full px-6 text-center text-xs text-muted-foreground">
                By clicking continue, you acknowledge the{' '}
                {branding.termsUrl && (
                  <Link href={branding.termsUrl} className="underline hover:text-primary">
                    Terms and Conditions
                  </Link>
                )}
                {branding.termsUrl && branding.privacyUrl ? ' and ' : ''}
                {branding.privacyUrl && (
                  <Link href={branding.privacyUrl} className="underline hover:text-primary">
                    Privacy Policy
                  </Link>
                )}
                .
              </p>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
}
