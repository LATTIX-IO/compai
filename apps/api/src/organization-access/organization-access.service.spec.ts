import { NotFoundException } from '@nestjs/common';
import { db } from '@db';
import { OrganizationAccessService } from './organization-access.service';

jest.mock('@db', () => ({
  db: {
    organization: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockedDb = db as unknown as {
  organization: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

const buildService = (
  overrides: Partial<{ isDomainActiveCustomer: jest.Mock }> = {},
) => {
  const isDomainActiveCustomer =
    overrides.isDomainActiveCustomer ?? jest.fn().mockResolvedValue(false);
  const stripeService = { isDomainActiveCustomer } as never;
  return {
    service: new OrganizationAccessService(stripeService),
    isDomainActiveCustomer,
  };
};

describe('OrganizationAccessService', () => {
  const ORIGINAL_SELF_HOSTED = process.env.SELF_HOSTED;
  const ORIGINAL_NEXT_SELF_HOSTED = process.env.NEXT_PUBLIC_SELF_HOSTED;
  const ORIGINAL_INTERNAL_TEAM_EMAIL_DOMAINS =
    process.env.INTERNAL_TEAM_EMAIL_DOMAINS;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SELF_HOSTED;
    delete process.env.NEXT_PUBLIC_SELF_HOSTED;
    delete process.env.INTERNAL_TEAM_EMAIL_DOMAINS;
    mockedDb.organization.update.mockResolvedValue({});
  });

  afterAll(() => {
    if (ORIGINAL_SELF_HOSTED === undefined) {
      delete process.env.SELF_HOSTED;
    } else {
      process.env.SELF_HOSTED = ORIGINAL_SELF_HOSTED;
    }
    if (ORIGINAL_NEXT_SELF_HOSTED === undefined) {
      delete process.env.NEXT_PUBLIC_SELF_HOSTED;
    } else {
      process.env.NEXT_PUBLIC_SELF_HOSTED = ORIGINAL_NEXT_SELF_HOSTED;
    }
    if (ORIGINAL_INTERNAL_TEAM_EMAIL_DOMAINS === undefined) {
      delete process.env.INTERNAL_TEAM_EMAIL_DOMAINS;
    } else {
      process.env.INTERNAL_TEAM_EMAIL_DOMAINS = ORIGINAL_INTERNAL_TEAM_EMAIL_DOMAINS;
    }
  });

  it('throws NotFoundException when org does not exist', async () => {
    mockedDb.organization.findUnique.mockResolvedValue(null);
    const { service } = buildService();

    await expect(
      service.autoApproveAccess({
        organizationId: 'org_x',
        userEmail: 'a@b.com',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns already-has-access without writing when org has access', async () => {
    mockedDb.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      hasAccess: true,
      website: 'acme.com',
    });
    const { service } = buildService();

    const result = await service.autoApproveAccess({
      organizationId: 'org_1',
      userEmail: 'user@acme.com',
    });

    expect(result).toEqual({
      hasAccess: true,
      autoApproved: false,
      reason: 'already-has-access',
    });
    expect(mockedDb.organization.update).not.toHaveBeenCalled();
  });

  it('grants on self-hosted via SELF_HOSTED env', async () => {
    process.env.SELF_HOSTED = 'true';
    mockedDb.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      hasAccess: false,
      website: null,
    });
    const { service, isDomainActiveCustomer } = buildService();

    const result = await service.autoApproveAccess({
      organizationId: 'org_1',
      userEmail: 'user@gmail.com',
    });

    expect(result).toEqual({
      hasAccess: true,
      autoApproved: true,
      reason: 'self-hosted',
    });
    expect(mockedDb.organization.update).toHaveBeenCalledWith({
      where: { id: 'org_1' },
      data: { hasAccess: true },
    });
    expect(isDomainActiveCustomer).not.toHaveBeenCalled();
  });

  it('grants on configured internal team email domains without consulting Stripe', async () => {
    process.env.INTERNAL_TEAM_EMAIL_DOMAINS = 'trycomp.ai,lattix.io';
    mockedDb.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      hasAccess: false,
      website: 'acme.com',
    });
    const { service, isDomainActiveCustomer } = buildService();

    const result = await service.autoApproveAccess({
      organizationId: 'org_1',
      userEmail: 'james@lattix.io',
    });

    expect(result).toEqual({
      hasAccess: true,
      autoApproved: true,
      reason: 'internal-email-domain',
    });
    expect(isDomainActiveCustomer).not.toHaveBeenCalled();
    expect(mockedDb.organization.update).toHaveBeenCalled();
  });

  it('grants when user email domain matches org website AND is an active Stripe customer', async () => {
    mockedDb.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      hasAccess: false,
      website: 'https://acme.com',
    });
    const { service, isDomainActiveCustomer } = buildService({
      isDomainActiveCustomer: jest.fn().mockResolvedValue(true),
    });

    const result = await service.autoApproveAccess({
      organizationId: 'org_1',
      userEmail: 'cfo@acme.com',
    });

    expect(result).toEqual({
      hasAccess: true,
      autoApproved: true,
      reason: 'stripe-customer',
    });
    expect(isDomainActiveCustomer).toHaveBeenCalledWith('acme.com');
    expect(mockedDb.organization.update).toHaveBeenCalled();
  });

  it('does not grant when domain matches but Stripe says not an active customer', async () => {
    mockedDb.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      hasAccess: false,
      website: 'acme.com',
    });
    const { service } = buildService({
      isDomainActiveCustomer: jest.fn().mockResolvedValue(false),
    });

    const result = await service.autoApproveAccess({
      organizationId: 'org_1',
      userEmail: 'cfo@acme.com',
    });

    expect(result).toEqual({
      hasAccess: false,
      autoApproved: false,
      reason: 'not-eligible',
    });
    expect(mockedDb.organization.update).not.toHaveBeenCalled();
  });

  it('does not grant when user email domain mismatches org website', async () => {
    mockedDb.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      hasAccess: false,
      website: 'acme.com',
    });
    const { service, isDomainActiveCustomer } = buildService();

    const result = await service.autoApproveAccess({
      organizationId: 'org_1',
      userEmail: 'cfo@example.com',
    });

    expect(result.autoApproved).toBe(false);
    expect(result.reason).toBe('not-eligible');
    expect(isDomainActiveCustomer).not.toHaveBeenCalled();
  });

  it('does not grant when user domain is a public mailbox provider', async () => {
    mockedDb.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      hasAccess: false,
      website: 'gmail.com', // pathological — even if website "matches", we refuse
    });
    const { service, isDomainActiveCustomer } = buildService();

    const result = await service.autoApproveAccess({
      organizationId: 'org_1',
      userEmail: 'someone@gmail.com',
    });

    expect(result.autoApproved).toBe(false);
    expect(isDomainActiveCustomer).not.toHaveBeenCalled();
  });

  it('does not grant when user email is missing', async () => {
    mockedDb.organization.findUnique.mockResolvedValue({
      id: 'org_1',
      hasAccess: false,
      website: 'acme.com',
    });
    const { service } = buildService();

    const result = await service.autoApproveAccess({
      organizationId: 'org_1',
      userEmail: undefined,
    });

    expect(result).toEqual({
      hasAccess: false,
      autoApproved: false,
      reason: 'not-eligible',
    });
  });
});
