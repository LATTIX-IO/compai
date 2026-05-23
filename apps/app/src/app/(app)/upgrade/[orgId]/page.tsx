import { findActiveMemberOrganizationAccess } from '@/lib/db/member-access';
import { ensureOrganizationAccess } from '@/lib/organization-access';
import { auth } from '@/utils/auth';
import { db } from '@db/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { BookingStep } from './components/booking-step';
import { UpgradePageTracking } from './UpgradePageTracking';

interface PageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function UpgradePage({ params }: PageProps) {
  const { orgId } = await params;

  // Get headers once to avoid multiple async calls
  const requestHeaders = await headers();

  // Check auth
  const authSession = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!authSession?.user?.id) {
    redirect('/sign-in');
  }

  // Verify user has access to this org BEFORE syncing activeOrganizationId
  const member = await findActiveMemberOrganizationAccess({
    organizationId: orgId,
    userId: authSession.user.id,
  });

  if (!member) {
    redirect('/');
  }

  const hasAccess = await ensureOrganizationAccess({
    currentActiveOrgId: authSession.session.activeOrganizationId,
    hasAccess: member.organization.hasAccess,
    logPrefix: 'UpgradePage',
    organizationId: orgId,
    requestHeaders,
    userEmail: authSession.user.email,
  });

  // If user has access to org but hasn't completed onboarding, redirect to onboarding
  if (hasAccess && !member.organization.onboardingCompleted) {
    redirect(`/onboarding/${orgId}`);
  }

  // If user has access to org and has completed onboarding, redirect to org
  if (hasAccess && member.organization.onboardingCompleted) {
    redirect(`/${orgId}`);
  }

  // Check if user has other completed orgs (for cancel button)
  const otherOrgCount = await db.member.count({
    where: {
      userId: authSession.user.id,
      organizationId: { not: orgId },
      deactivated: false,
      organization: { onboardingCompleted: true, hasAccess: true },
    },
  });

  return (
    <>
      <UpgradePageTracking />
      <div className="mx-auto px-4 max-w-7xl my-auto min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <BookingStep
          company={member.organization.name}
          orgId={orgId}
          hasAccess={hasAccess}
          hasOtherOrgs={otherOrgCount > 0}
        />
      </div>
    </>
  );
}
