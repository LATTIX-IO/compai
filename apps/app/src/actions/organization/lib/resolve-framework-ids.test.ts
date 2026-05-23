import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@db/server', () => ({
  db: {
    context: {
      findFirst: vi.fn(),
    },
    frameworkEditorFramework: {
      findMany: vi.fn(),
    },
  },
}));

import { db } from '@db/server';
import { resolveFrameworkIds } from './resolve-framework-ids';

const mockDb = db as unknown as {
  context: { findFirst: ReturnType<typeof vi.fn> };
  frameworkEditorFramework: { findMany: ReturnType<typeof vi.fn> };
};

describe('resolveFrameworkIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns raw framework ids when onboarding context stores them as JSON', async () => {
    mockDb.context.findFirst.mockResolvedValueOnce({
      answer: JSON.stringify(['frk_iso27001', 'frk_soc2']),
    });

    const result = await resolveFrameworkIds('org_123');

    expect(result).toEqual(['frk_iso27001', 'frk_soc2']);
    expect(mockDb.context.findFirst).toHaveBeenCalledTimes(1);
    expect(mockDb.frameworkEditorFramework.findMany).not.toHaveBeenCalled();
  });

  it('falls back to resolving framework names when raw ids are not available', async () => {
    mockDb.context.findFirst
      .mockResolvedValueOnce({
        answer: 'not-json',
      })
      .mockResolvedValueOnce({
        answer: 'SOC 2, ISO 27001',
      });
    mockDb.frameworkEditorFramework.findMany.mockResolvedValueOnce([
      { id: 'frk_soc2' },
      { id: 'frk_iso27001' },
    ]);

    const result = await resolveFrameworkIds('org_456');

    expect(result).toEqual(['frk_soc2', 'frk_iso27001']);
    expect(mockDb.frameworkEditorFramework.findMany).toHaveBeenCalledWith({
      where: {
        name: { in: ['SOC 2', 'ISO 27001'], mode: 'insensitive' },
      },
      select: { id: true },
    });
  });

  it('returns an empty array when no onboarding framework context is present', async () => {
    mockDb.context.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const result = await resolveFrameworkIds('org_789');

    expect(result).toEqual([]);
    expect(mockDb.frameworkEditorFramework.findMany).not.toHaveBeenCalled();
  });
});