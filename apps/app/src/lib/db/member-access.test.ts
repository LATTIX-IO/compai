import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@db/server', () => ({
  db: {
    member: {
      findFirst: vi.fn(),
    },
  },
}));

import { db } from '@db/server';
import {
  findActiveMemberOrganizationAccess,
  findActiveMemberRole,
} from './member-access';

const mockedFindFirst = vi.mocked(
  (db as unknown as { member: { findFirst: ReturnType<typeof vi.fn> } }).member.findFirst,
);

describe('member access queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads only organization access fields for upgrade routing', async () => {
    mockedFindFirst.mockResolvedValue({
      organization: {
        id: 'org_1',
        name: 'Lattix',
        hasAccess: false,
        onboardingCompleted: false,
      },
    });

    const result = await findActiveMemberOrganizationAccess({
      organizationId: 'org_1',
      userId: 'user_1',
    });

    expect(result).toEqual({
      organization: {
        id: 'org_1',
        name: 'Lattix',
        hasAccess: false,
        onboardingCompleted: false,
      },
    });
    expect(mockedFindFirst).toHaveBeenCalledWith({
      where: {
        organizationId: 'org_1',
        userId: 'user_1',
        deactivated: false,
      },
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
  });

  it('loads only the role field for shell permission checks', async () => {
    mockedFindFirst.mockResolvedValue({
      role: 'owner',
    });

    const result = await findActiveMemberRole({
      organizationId: 'org_1',
      userId: 'user_1',
    });

    expect(result).toEqual({ role: 'owner' });
    expect(mockedFindFirst).toHaveBeenCalledWith({
      where: {
        organizationId: 'org_1',
        userId: 'user_1',
        deactivated: false,
      },
      select: {
        role: true,
      },
    });
  });
});