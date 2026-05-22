'use client';

import { buildBridgedAuthCallbackUrl } from '@/lib/app-session';
import { authClient } from '@/utils/auth-client';
import { Button } from '@trycompai/ui/button';
import { Icons } from '@trycompai/ui/icons';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface GoogleSignInProps {
  inviteCode?: string;
  redirectTo?: string;
}

export function GoogleSignIn({ inviteCode, redirectTo }: GoogleSignInProps) {
  const [isLoading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);

    const callbackURL = buildBridgedAuthCallbackUrl({
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
      appOrigin: window.location.origin,
      inviteCode,
      redirectTo,
    });

    await authClient.signIn.social({
      provider: 'google',
      callbackURL,
    });
  };

  return (
    <Button
      onClick={handleSignIn}
      className="w-full h-11 font-medium"
      variant="outline"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Icons.Google className="h-4 w-4" />
          Continue with Google
        </>
      )}
    </Button>
  );
}
