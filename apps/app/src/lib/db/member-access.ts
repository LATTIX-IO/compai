import { db } from '@db/server';

interface ActiveMemberParams {
  organizationId: string;
  userId: string;
}

function activeMemberWhere({ organizationId, userId }: ActiveMemberParams) {
  return {
    organizationId,
    userId,
    deactivated: false,
  };
}

// The production app database can lag newer Member columns. Keep the
// auth/upgrade shell on narrow selects so Prisma doesn't implicitly request
// every scalar field during login-path membership checks.
export async function findActiveMemberOrganizationAccess({
  organizationId,
  userId,
}: ActiveMemberParams) {
  return db.member.findFirst({
    where: activeMemberWhere({ organizationId, userId }),
    select: {
      organization: {
        select: {
          id: true,
          name: true,
          hasAccess: true,
          onboardingCompleted: true,
        },
      },
    },
  });
}

export async function findActiveMemberRole({
  organizationId,
  userId,
}: ActiveMemberParams) {
  return db.member.findFirst({
    where: activeMemberWhere({ organizationId, userId }),
    select: {
      role: true,
    },
  });
}