import { buildSeedId } from './build-seed-id';

export interface FrameworkSeedRow {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  visible: boolean;
}

interface RequestedFrameworkBase {
  key: string;
  name: string;
  description: string;
  version: string;
  visible: boolean;
}

interface CreateRequestedFramework extends RequestedFrameworkBase {
  action: 'create';
}

interface VerifyExistingRequestedFramework extends RequestedFrameworkBase {
  action: 'verify-existing';
  existingId: string;
}

export type RequestedFrameworkDefinition =
  | CreateRequestedFramework
  | VerifyExistingRequestedFramework;

export const REQUESTED_FRAMEWORK_SEED_TIMESTAMP = '2026-05-06 00:00:00.000';

export const REQUESTED_FRAMEWORKS: readonly RequestedFrameworkDefinition[] = [
  {
    action: 'verify-existing',
    key: 'iso-27001-2022',
    existingId: 'frk_681ecc34e85064efdbb76993',
    name: 'ISO 27001',
    description: 'ISO 27001',
    version: '2022',
    visible: true,
  },
  {
    action: 'create',
    key: 'nist-800-53-rev-5',
    name: 'NIST 800-53 Rev. 5',
    description: 'Security and Privacy Controls for Information Systems and Organizations',
    version: 'Rev. 5',
    visible: false,
  },
  {
    action: 'create',
    key: 'nist-800-53-rev-5-nss',
    name: 'NIST 800-53 Rev. 5 NSS',
    description: 'NIST 800-53 Rev. 5 controls with the National Security Systems overlay',
    version: 'Rev. 5',
    visible: false,
  },
  {
    action: 'create',
    key: 'fedramp-low',
    name: 'FedRAMP Low',
    description: 'FedRAMP Low baseline mapped to NIST 800-53 Rev. 5',
    version: 'Rev. 5',
    visible: false,
  },
  {
    action: 'create',
    key: 'fedramp-high',
    name: 'FedRAMP High',
    description: 'FedRAMP High baseline mapped to NIST 800-53 Rev. 5',
    version: 'Rev. 5',
    visible: false,
  },
  {
    action: 'create',
    key: 'cmmc-level-1',
    name: 'CMMC Level 1',
    description: 'Cybersecurity Maturity Model Certification Level 1',
    version: '2.0',
    visible: false,
  },
  {
    action: 'create',
    key: 'cmmc-level-2',
    name: 'CMMC Level 2',
    description: 'Cybersecurity Maturity Model Certification Level 2',
    version: '2.0',
    visible: false,
  },
  {
    action: 'create',
    key: 'cmmc-level-3',
    name: 'CMMC Level 3',
    description: 'Cybersecurity Maturity Model Certification Level 3',
    version: '2.0',
    visible: false,
  },
  {
    action: 'create',
    key: 'nist-800-171-rev-3',
    name: 'NIST 800-171 Rev. 3',
    description:
      'Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations',
    version: 'Rev. 3',
    visible: false,
  },
] as const;

function isCreateFramework(
  framework: RequestedFrameworkDefinition,
): framework is CreateRequestedFramework {
  return framework.action === 'create';
}

function buildFrameworkSeedRow(framework: CreateRequestedFramework): FrameworkSeedRow {
  return {
    id: buildSeedId('frk', `framework:${framework.key}`),
    name: framework.name,
    description: framework.description,
    version: framework.version,
    createdAt: REQUESTED_FRAMEWORK_SEED_TIMESTAMP,
    updatedAt: REQUESTED_FRAMEWORK_SEED_TIMESTAMP,
    visible: framework.visible,
  };
}

function hasSameMetadata(current: FrameworkSeedRow, target: FrameworkSeedRow): boolean {
  return (
    current.name === target.name &&
    current.description === target.description &&
    current.version === target.version &&
    current.visible === target.visible
  );
}

function findFrameworkIndex(
  frameworks: readonly FrameworkSeedRow[],
  target: Pick<FrameworkSeedRow, 'id' | 'name' | 'version'>,
): number {
  const byIdIndex = frameworks.findIndex((framework) => framework.id === target.id);
  if (byIdIndex !== -1) {
    return byIdIndex;
  }

  return frameworks.findIndex(
    (framework) => framework.name === target.name && framework.version === target.version,
  );
}

export function buildRequestedFrameworkSeedRows(): FrameworkSeedRow[] {
  return REQUESTED_FRAMEWORKS.filter(isCreateFramework).map(buildFrameworkSeedRow);
}

export function upsertRequestedFrameworkMetadata(existingFrameworks: readonly FrameworkSeedRow[]): {
  frameworks: FrameworkSeedRow[];
  created: number;
  updated: number;
  verified: number;
} {
  const frameworks = existingFrameworks.map((framework) => ({ ...framework }));
  let created = 0;
  let updated = 0;
  let verified = 0;

  for (const requestedFramework of REQUESTED_FRAMEWORKS) {
    if (!isCreateFramework(requestedFramework)) {
      const existingIndex = findFrameworkIndex(frameworks, {
        id: requestedFramework.existingId,
        name: requestedFramework.name,
        version: requestedFramework.version,
      });

      if (existingIndex === -1) {
        throw new Error(
          `Expected existing framework metadata for ${requestedFramework.name} (${requestedFramework.version}).`,
        );
      }

      verified += 1;
      continue;
    }

    const nextFramework = buildFrameworkSeedRow(requestedFramework);
    const existingIndex = findFrameworkIndex(frameworks, nextFramework);

    if (existingIndex === -1) {
      frameworks.push(nextFramework);
      created += 1;
      continue;
    }

    const currentFramework = frameworks[existingIndex];
    if (!currentFramework) {
      throw new Error(`Expected framework metadata at index ${existingIndex}.`);
    }

    if (hasSameMetadata(currentFramework, nextFramework)) {
      continue;
    }

    frameworks[existingIndex] = {
      ...currentFramework,
      name: nextFramework.name,
      description: nextFramework.description,
      version: nextFramework.version,
      updatedAt: nextFramework.updatedAt,
      visible: nextFramework.visible,
    };
    updated += 1;
  }

  return {
    frameworks,
    created,
    updated,
    verified,
  };
}
