import '@trycompai/design-system/globals.css';

import { env } from '@/env.mjs';
import { getAppBranding } from '@/lib/platform-deployment';
import { auth } from '@/utils/auth';
import { Analytics as DubAnalytics } from '@dub/analytics/react';
import { cn } from '@trycompai/design-system';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { GeistMono } from 'geist/font/mono';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import { Providers } from './providers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const branding = getAppBranding(env);
const metadataTitle = `${branding.appName} | ${branding.appDescription}`;

export const metadata: Metadata = {
  metadataBase: new URL(branding.appUrl),
  title: metadataTitle,
  description: branding.appDescription,
  twitter: {
    title: metadataTitle,
    description: branding.appDescription,
    images: [
      {
        url: branding.ogImageUrl,
        width: 800,
        height: 600,
      },
      {
        url: branding.ogImageUrl,
        width: 1800,
        height: 1600,
      },
    ],
  },
  openGraph: {
    title: metadataTitle,
    description: branding.appDescription,
    url: branding.appUrl,
    siteName: branding.appName,
    images: [
      {
        url: branding.ogImageUrl,
        width: 800,
        height: 600,
      },
      {
        url: branding.ogImageUrl,
        width: 1800,
        height: 1600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)' },
    { media: '(prefers-color-scheme: dark)' },
  ],
};

const font = localFont({
  src: '/../../public/fonts/GeneralSans-Variable.ttf',
  display: 'swap',
  variable: '--font-general-sans',
});

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const dubIsEnabled = env.DUB_API_KEY !== undefined;
  const dubReferUrl = env.DUB_REFER_URL;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {dubIsEnabled && dubReferUrl && (
          <DubAnalytics
            domainsConfig={{
              refer: dubReferUrl,
            }}
          />
        )}
      </head>
      <body className={cn(`${GeistMono.variable} ${font.variable}`, 'antialiased')}>
        <NuqsAdapter>
          <Providers session={session}>{children}</Providers>
        </NuqsAdapter>
        <Toaster richColors />
        <VercelAnalytics />
      </body>
    </html>
  );
}
