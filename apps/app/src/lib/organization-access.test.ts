import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-server', () => ({
  serverApi: {
    post: vi.fn(),
  },
}));

vi.mock('@/utils/auth', () => ({
  auth: {
    api: {
      setActiveOrganization: vi.fn(),
    },
  },
}));

vi.mock('@db/server', () => ({
  db: {
    organization: {
      update: vi.fn(),
    },
  },
}));

import { serverApi } from '@/lib/api-server';
import { auth } from '@/utils/auth';
import { db } from '@db/server';
import {
  ensureOrganizationAccess,
  shouldAutoGrantOrgAccessOnCreate,
} from './organization-access';

const mockedAutoApprove = vi.mocked(serverApi.post);
const mockedSetActiveOrganization = vi.mocked(auth.api.setActiveOrganization);
const mockedUpdateOrganization = vi.mocked(db.organization.update);

describe('organization access helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('auto-grants access in production for configured internal domains', () => {
    expect(
      shouldAutoGrantOrgAccessOnCreate({
        userEmail: 'james@lattix.io',
        appEnv: 'production',
        selfHosted: 'false',
        internalTeamEmailDomains: ['lattix.io', 'trycomp.ai'],
      }),
    ).toBe(true);
  });

  it('auto-grants access when self-hosted', () => {
    expect(
      shouldAutoGrantOrgAccessOnCreate({
        userEmail: 'someone@example.com',
        appEnv: 'production',
        selfHosted: 'true',
        internalTeamEmailDomains: [],
      }),
    ).toBe(true);
  });

  it('updates the organization directly for internal deployments', async () => {
    mockedUpdateOrganization.mockResolvedValue({ id: 'org_1', hasAccess: true });

    const result = await ensureOrganizationAccess({
      appEnv: 'production',
      currentActiveOrgId: 'org_1',
      hasAccess: false,
      internalTeamEmailDomains: ['lattix.io'],
      logPrefix: 'Test',
      organizationId: 'org_1',
      requestHeaders: new Headers(),
      selfHosted: 'false',
      userEmail: 'james@lattix.io',
    });

    expect(result).toBe(true);
    expect(mockedUpdateOrganization).toHaveBeenCalledWith({
      where: { id: 'org_1' },
      data: { hasAccess: true },
    });
    expect(mockedSetActiveOrganization).not.toHaveBeenCalled();
    expect(mockedAutoApprove).not.toHaveBeenCalled();
  });

  it('falls back to the API auto-approve flow for non-internal users', async () => {
    mockedAutoApprove.mockResolvedValue({
      data: {
        hasAccess: true,
        autoApproved: true,
        reason: 'stripe-customer',
      },
      status: 200,
    });

    const headers = new Headers();
    const result = await ensureOrganizationAccess({
      appEnv: 'production',
      currentActiveOrgId: 'org_old',
      hasAccess: false,
      internalTeamEmailDomains: ['lattix.io'],
      logPrefix: 'Test',
      organizationId: 'org_1',
      requestHeaders: headers,
      selfHosted: 'false',
      userEmail: 'someone@example.com',
    });

    expect(result).toBe(true);
    expect(mockedSetActiveOrganization).toHaveBeenCalledWith({
      headers,
      body: { organizationId: 'org_1' },
    });
    expect(mockedAutoApprove).toHaveBeenCalledWith('/v1/organization-access/auto-approve');
  });
});