'use client';

import { authClient } from '@/app/lib/auth-client';
import { buildSocialSignInCallbackUrl } from '@/app/lib/portal-session';
import { Button } from '@trycompai/design-system';
import { Icons } from '@trycompai/ui/icons';
import { useState } from 'react';

export function GoogleSignIn({
  inviteCode,
  searchParams,
}: {
  inviteCode?: string;
  searchParams?: URLSearchParams;
}) {
  const [isLoading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);

    const baseURL = window.location.origin;
    const redirectTo = buildSocialSignInCallbackUrl({
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
      portalOrigin: baseURL,
      inviteCode,
      searchParams,
    });

    await authClient.signIn.social({
      provider: 'google',
      callbackURL: redirectTo,
    });
  };

  return (
    <div className="w-full [&>button]:h-11 [&>button]:w-full">
      <Button
        onClick={handleSignIn}
        variant="outline"
        loading={isLoading}
        iconLeft={isLoading ? undefined : <Icons.Google className="h-4 w-4" />}
        disabled={isLoading}
      >
        Continue with Google
      </Button>
    </div>
  );
}
