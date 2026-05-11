import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { z } from 'zod';
import { buildSeedId } from './build-seed-id';

const RequirementSeedRowSchema = z.object({
  id: z.string(),
  frameworkId: z.string(),
  identifier: z.string(),
  name: z.string(),
  description: z.string(),
});

const ControlTemplateSeedRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

const RequirementRelationSeedRowSchema = z.object({
  A: z.string(),
  B: z.string(),
});

const RequirementSeedRowsSchema = z.array(RequirementSeedRowSchema);
const ControlTemplateSeedRowsSchema = z.array(ControlTemplateSeedRowSchema);
const RequirementRelationSeedRowsSchema = z.array(RequirementRelationSeedRowSchema);

const NIST_800_53_R5_FRAMEWORK_ID = 'frk_651b5bc3da3877d883014ab6';
const FEDRAMP_LOW_FRAMEWORK_ID = 'frk_068c037257b80e088c80c4c9';
const FEDRAMP_HIGH_FRAMEWORK_ID = 'frk_4d3afeb33f6115241978c3dc';

const EXPECTED_NIST_800_53_R5_REQUIREMENT_COUNT = 1014;
const EXPECTED_NIST_800_53_R5_CONTROL_TEMPLATE_COUNT = 1014;
const EXPECTED_FEDRAMP_LOW_REQUIREMENT_COUNT = 149;
const EXPECTED_FEDRAMP_HIGH_REQUIREMENT_COUNT = 370;

const currentDirectory = __dirname;

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(path.join(currentDirectory, relativePath), 'utf8'));
}

const nistRequirements = RequirementSeedRowsSchema.parse(
  readJson('../../prisma/seed/primitives/FrameworkEditorRequirement__nist-800-53-r5.json'),
);
const nistControlTemplates = ControlTemplateSeedRowsSchema.parse(
  readJson('../../prisma/seed/primitives/FrameworkEditorControlTemplate__nist-800-53-r5.json'),
);
const nistRelations = RequirementRelationSeedRowsSchema.parse(
  readJson(
    '../../prisma/seed/relations/_FrameworkEditorControlTemplateToFrameworkEditorRequirement__nist-800-53-r5.json',
  ),
);
const fedrampLowRequirements = RequirementSeedRowsSchema.parse(
  readJson('../../prisma/seed/primitives/FrameworkEditorRequirement__fedramp-low.json'),
);
const fedrampLowRelations = RequirementRelationSeedRowsSchema.parse(
  readJson(
    '../../prisma/seed/relations/_FrameworkEditorControlTemplateToFrameworkEditorRequirement__fedramp-low.json',
  ),
);
const fedrampHighRequirements = RequirementSeedRowsSchema.parse(
  readJson('../../prisma/seed/primitives/FrameworkEditorRequirement__fedramp-high.json'),
);
const fedrampHighRelations = RequirementRelationSeedRowsSchema.parse(
  readJson(
    '../../prisma/seed/relations/_FrameworkEditorControlTemplateToFrameworkEditorRequirement__fedramp-high.json',
  ),
);

const nistRequirementById = new Map(nistRequirements.map((row) => [row.id, row]));
const nistRequirementIds = new Set(nistRequirements.map((row) => row.id));
const nistIdentifiers = new Set(nistRequirements.map((row) => row.identifier));
const nistControlTemplateIds = new Set(nistControlTemplates.map((row) => row.id));
const nistControlTemplateById = new Map(nistControlTemplates.map((row) => [row.id, row]));

function assertDeterministicRequirementIds(
  rows: z.infer<typeof RequirementSeedRowSchema>[],
  frameworkKey: string,
) {
  for (const requirement of rows) {
    assert.equal(
      requirement.id,
      buildSeedId('frk_rq', `framework:${frameworkKey}:requirement:${requirement.identifier}`),
    );
  }
}

function assertSharedControlMappings(
  rows: z.infer<typeof RequirementSeedRowSchema>[],
  relations: z.infer<typeof RequirementRelationSeedRowSchema>[],
) {
  const relationByRequirementId = new Map<string, string>();

  for (const relation of relations) {
    assert.ok(nistControlTemplateIds.has(relation.A));
    assert.equal(relationByRequirementId.has(relation.B), false);
    relationByRequirementId.set(relation.B, relation.A);
  }

  for (const requirement of rows) {
    assert.ok(nistIdentifiers.has(requirement.identifier));

    const expectedControlTemplateId = buildSeedId(
      'frk_ct',
      `control-template:nist-800-53-rev-5:${requirement.identifier}`,
    );

    assert.equal(relationByRequirementId.get(requirement.id), expectedControlTemplateId);
  }
}

describe('nist-800-53 rev. 5 seed coverage', () => {
  it('includes the full base catalog and shared control template set', () => {
    assert.equal(nistRequirements.length, EXPECTED_NIST_800_53_R5_REQUIREMENT_COUNT);
    assert.equal(nistControlTemplates.length, EXPECTED_NIST_800_53_R5_CONTROL_TEMPLATE_COUNT);
    assert.equal(
      new Set(nistRequirements.map((row) => row.id)).size,
      EXPECTED_NIST_800_53_R5_REQUIREMENT_COUNT,
    );
    assert.equal(
      new Set(nistRequirements.map((row) => row.identifier)).size,
      EXPECTED_NIST_800_53_R5_REQUIREMENT_COUNT,
    );
    assert.equal(
      new Set(nistControlTemplates.map((row) => row.id)).size,
      EXPECTED_NIST_800_53_R5_CONTROL_TEMPLATE_COUNT,
    );
    assert.equal(
      nistRequirements.every((row) => row.frameworkId === NIST_800_53_R5_FRAMEWORK_ID),
      true,
    );
    assert.equal(nistRequirements.every((row) => row.description.trim().length > 0), true);
    assert.equal(nistControlTemplates.every((row) => row.description.trim().length > 0), true);
  });

  it('uses deterministic ids and stable sample names for representative controls', () => {
    assertDeterministicRequirementIds(nistRequirements, 'nist-800-53-rev-5');

    const sampleExpectations = [
      ['AC-1', 'Policy and Procedures', 'AC-1 Policy and Procedures'],
      ['AC-2(1)', 'Automated System Account Management', 'AC-2(1) Automated System Account Management'],
      ['SC-7', 'Boundary Protection', 'SC-7 Boundary Protection'],
      ['SI-4', 'System Monitoring', 'SI-4 System Monitoring'],
    ] as const;

    for (const [identifier, requirementName, controlTemplateName] of sampleExpectations) {
      const requirement = nistRequirements.find((row) => row.identifier === identifier);
      assert.ok(requirement);
      assert.equal(requirement.name, requirementName);
      assert.equal(
        requirement.id,
        buildSeedId('frk_rq', `framework:nist-800-53-rev-5:requirement:${identifier}`),
      );

      const controlTemplateId = buildSeedId(
        'frk_ct',
        `control-template:nist-800-53-rev-5:${identifier}`,
      );
      const controlTemplate = nistControlTemplateById.get(controlTemplateId);
      assert.ok(controlTemplate);
      assert.equal(controlTemplate.name, controlTemplateName);
    }
  });

  it('maps every base requirement to exactly one shared control template', () => {
    assert.equal(nistRelations.length, EXPECTED_NIST_800_53_R5_REQUIREMENT_COUNT);
    assert.equal(
      new Set(nistRelations.map((row) => `${row.A}:${row.B}`)).size,
      EXPECTED_NIST_800_53_R5_REQUIREMENT_COUNT,
    );

    const mappedRequirementIds = new Set(nistRelations.map((row) => row.B));
    assert.deepEqual(mappedRequirementIds, nistRequirementIds);

    for (const relation of nistRelations) {
      const requirement = nistRequirementById.get(relation.B);
      assert.ok(requirement);
      assert.equal(
        relation.A,
        buildSeedId('frk_ct', `control-template:nist-800-53-rev-5:${requirement.identifier}`),
      );
    }
  });
});

describe('fedramp low/high overlays mapped onto the 800-53 rev. 5 catalog', () => {
  it('seeds the expected requirement counts with deterministic ids', () => {
    assert.equal(fedrampLowRequirements.length, EXPECTED_FEDRAMP_LOW_REQUIREMENT_COUNT);
    assert.equal(fedrampHighRequirements.length, EXPECTED_FEDRAMP_HIGH_REQUIREMENT_COUNT);
    assert.equal(
      fedrampLowRequirements.every((row) => row.frameworkId === FEDRAMP_LOW_FRAMEWORK_ID),
      true,
    );
    assert.equal(
      fedrampHighRequirements.every((row) => row.frameworkId === FEDRAMP_HIGH_FRAMEWORK_ID),
      true,
    );

    assertDeterministicRequirementIds(fedrampLowRequirements, 'fedramp-low');
    assertDeterministicRequirementIds(fedrampHighRequirements, 'fedramp-high');
  });

  it('reuses the shared control catalog for overlay mappings', () => {
    assert.equal(fedrampLowRelations.length, EXPECTED_FEDRAMP_LOW_REQUIREMENT_COUNT);
    assert.equal(fedrampHighRelations.length, EXPECTED_FEDRAMP_HIGH_REQUIREMENT_COUNT);
    assertSharedControlMappings(fedrampLowRequirements, fedrampLowRelations);
    assertSharedControlMappings(fedrampHighRequirements, fedrampHighRelations);
  });
});
