'use client';

import { GithubSignIn } from '@/components/github-sign-in';
import { GoogleSignIn } from '@/components/google-sign-in';
import { MagicLinkSignIn } from '@/components/magic-link';
import { MicrosoftSignIn } from '@/components/microsoft-sign-in';
import { Button } from '@trycompai/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@trycompai/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@trycompai/ui/collapsible';
import { CheckmarkFilled, ChevronDown, ChevronUp } from '@trycompai/design-system/icons';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface LoginFormProps {
  inviteCode?: string;
  redirectTo?: string;
  showGoogle: boolean;
  showGithub: boolean;
  showMicrosoft: boolean;
  allowMagicLink: boolean;
}

export function LoginForm({
  inviteCode,
  redirectTo,
  showGoogle,
  showGithub,
  showMicrosoft,
  allowMagicLink,
}: LoginFormProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [magicLinkState, setMagicLinkState] = useState({ sent: false, email: '' });

  const handleMagicLinkSent = (email: string) => {
    setMagicLinkState({ sent: true, email });
  };

  if (magicLinkState.sent) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center text-center space-y-6 py-16 px-6">
          <CheckmarkFilled size={64} className="text-primary" />
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-card-foreground">
              Magic link sent
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Check your inbox at{' '}
              <span className="font-semibold text-foreground">{magicLinkState.email}</span> for a
              magic link to sign in.
            </CardDescription>
          </div>
          <Button variant="link" onClick={() => setMagicLinkState({ sent: false, email: '' })}>
            Use another method
          </Button>
        </CardContent>
      </Card>
    );
  }

  const signInOptions: ReactNode[] = [];

  if (showGoogle) {
    signInOptions.push(
      <GoogleSignIn key="google" inviteCode={inviteCode} redirectTo={redirectTo} />,
    );
  }

  if (showMicrosoft) {
    signInOptions.push(
      <MicrosoftSignIn key="microsoft" inviteCode={inviteCode} redirectTo={redirectTo} />,
    );
  }

  if (showGithub) {
    signInOptions.push(
      <GithubSignIn key="github" inviteCode={inviteCode} redirectTo={redirectTo} />,
    );
  }

  if (allowMagicLink) {
    signInOptions.push(
      <MagicLinkSignIn
        key="magic-link"
        inviteCode={inviteCode}
        redirectTo={redirectTo}
        onMagicLinkSubmit={handleMagicLinkSent}
      />,
    );
  }

  const [preferredSignInOption, ...moreOptionsList] = signInOptions;

  if (!preferredSignInOption) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center text-center space-y-3 py-10 px-6">
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Sign-in is not configured
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Ask an administrator to configure at least one sign-in method for this deployment.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {preferredSignInOption}

      {moreOptionsList.length > 0 && (
        <Collapsible open={isOptionsOpen} onOpenChange={setIsOptionsOpen} className="w-full">
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-x-0 top-1/2 flex items-center">
              <span className="w-full border-t" />
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative px-4 text-sm text-muted-foreground bg-background hover:bg-muted"
              >
                More options
                {isOptionsOpen ? (
                  <ChevronUp size={16} className="ml-1 transition-transform duration-200" />
                ) : (
                  <ChevronDown size={16} className="ml-1 transition-transform duration-200" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-4 pt-4 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
            {moreOptionsList}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
