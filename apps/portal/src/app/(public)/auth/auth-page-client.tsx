'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  LogoIcon,
} from '@trycompai/design-system';

const LoginForm = dynamic(() => import('@/app/components/login-form').then((mod) => mod.LoginForm), {
  ssr: false,
});

const OtpSignIn = dynamic(() => import('@/app/components/otp').then((mod) => mod.OtpSignIn), {
  ssr: false,
});

interface AuthPageClientProps {
  appName: string;
  termsUrl?: string;
  privacyUrl?: string;
  portalDescription: string;
  allowOtp: boolean;
  showGoogle: boolean;
  showMicrosoft: boolean;
  showBrandLogo: boolean;
  brandInitials: string;
  hasVisibleAuthOptions: boolean;
  hasLegalLinks: boolean;
  deviceAuthRedirect?: string;
}

export function AuthPageClient({
  appName,
  termsUrl,
  privacyUrl,
  portalDescription,
  allowOtp,
  showGoogle,
  showMicrosoft,
  showBrandLogo,
  brandInitials,
  hasVisibleAuthOptions,
  hasLegalLinks,
  deviceAuthRedirect,
}: AuthPageClientProps) {
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
                    {brandInitials}
                  </div>
                )}
                <div className="text-2xl tracking-tight text-card-foreground">
                  <CardTitle>{`Sign in to ${appName}`}</CardTitle>
                </div>
                <div className="px-4 text-base text-muted-foreground">
                  <CardDescription>{portalDescription}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pb-6">
                {allowOtp ? (
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
                <LoginForm showGoogle={showGoogle} showMicrosoft={showMicrosoft} />
              </div>
            </CardContent>
            {hasLegalLinks ? (
              <CardFooter>
                <p className="w-full px-2 pb-10 text-center text-xs text-muted-foreground">
                  By clicking continue, you acknowledge the{' '}
                  {termsUrl ? (
                    <Link href={termsUrl} className="underline hover:text-primary">
                      Terms and Conditions
                    </Link>
                  ) : null}
                  {termsUrl && privacyUrl ? ' and ' : ''}
                  {privacyUrl ? (
                    <Link href={privacyUrl} className="underline hover:text-primary">
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