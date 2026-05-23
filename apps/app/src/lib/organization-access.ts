import 'server-only';

import { serverApi } from '@/lib/api-server';
import { auth } from '@/utils/auth';
import { db } from '@db/server';

interface AutoApproveResponse {
  hasAccess: boolean;
  autoApproved: boolean;
  reason: string;
}

interface ShouldAutoGrantOrgAccessParams {
  userEmail?: string | null;
  appEnv?: string | undefined;
  selfHosted?: string | undefined;
  internalTeamEmailDomains?: string[];
}

interface EnsureOrganizationAccessParams {
  appEnv?: string | undefined;
  currentActiveOrgId?: string | null;
  hasAccess: boolean;
  internalTeamEmailDomains?: string[];
  logPrefix: string;
  organizationId: string;
  requestHeaders: Headers;
  selfHosted?: string | undefined;
  userEmail?: string | null;
}

function normalizeDomain(domain: string | undefined): string | undefined {
  const normalized = domain?.trim().toLowerCase().replace(/^@/, '');
  return normalized ? normalized : undefined;
}

function getEmailDomain(email: string | null | undefined): string | undefined {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return undefined;
  }

  return normalizeDomain(normalizedEmail.split('@').pop());
}

export function getInternalTeamEmailDomains(env: NodeJS.ProcessEnv = process.env): string[] {
  return (env.INTERNAL_TEAM_EMAIL_DOMAINS ?? '')
    .split(',')
    .map((domain) => normalizeDomain(domain))
    .filter((domain): domain is string => Boolean(domain));
}

export function shouldAutoGrantOrgAccessOnCreate({
  userEmail,
  appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
  selfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED,
  internalTeamEmailDomains = getInternalTeamEmailDomains(),
}: ShouldAutoGrantOrgAccessParams): boolean {
  if (appEnv !== 'production') {
    return true;
  }

  if (selfHosted === 'true') {
    return true;
  }

  const emailDomain = getEmailDomain(userEmail);

  if (!emailDomain) {
    return false;
  }

  return internalTeamEmailDomains.includes(emailDomain);
}

export async function ensureOrganizationAccess({
  appEnv,
  currentActiveOrgId,
  hasAccess,
  internalTeamEmailDomains,
  logPrefix,
  organizationId,
  requestHeaders,
  selfHosted,
  userEmail,
}: EnsureOrganizationAccessParams): Promise<boolean> {
  if (hasAccess) {
    return true;
  }

  if (shouldAutoGrantOrgAccessOnCreate({ userEmail, appEnv, selfHosted, internalTeamEmailDomains })) {
    try {
      await db.organization.update({
        where: { id: organizationId },
        data: { hasAccess: true },
      });
      return true;
    } catch (error) {
      console.error(`[${logPrefix}] Failed to auto-grant internal org access:`, error);
    }
  }

  if (!currentActiveOrgId || currentActiveOrgId !== organizationId) {
    try {
      await auth.api.setActiveOrganization({
        headers: requestHeaders,
        body: {
          organizationId,
        },
      });
    } catch (error) {
      console.error(`[${logPrefix}] Failed to sync activeOrganizationId:`, error);
    }
  }

  const response = await serverApi.post<AutoApproveResponse>(
    '/v1/organization-access/auto-approve',
  );

  if (response.data?.hasAccess) {
    return true;
  }

  if (response.error) {
    console.error(`[${logPrefix}] auto-approve API error:`, response.error);
  }

  return false;
}