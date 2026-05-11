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

const RequirementRelationSeedRowSchema = z.object({
  A: z.string(),
  B: z.string(),
});

const RequirementSeedRowsSchema = z.array(RequirementSeedRowSchema);
const RequirementRelationSeedRowsSchema = z.array(RequirementRelationSeedRowSchema);

const NIST_800_171_R3_FRAMEWORK_ID = 'frk_df6d25307ba889ab61ba27bc';
const EXPECTED_REQUIREMENT_COUNT = 97;
const EXPECTED_RELATION_COUNT = 207;
const EXPECTED_FIRST_REQUIREMENT_ID = 'frk_rq_200a7cdcf6abb06cc2b7e11e';

const currentDirectory = __dirname;

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(path.join(currentDirectory, relativePath), 'utf8'));
}

const requirementSeedRows = RequirementSeedRowsSchema.parse(
  readJson('../../prisma/seed/primitives/FrameworkEditorRequirement.json'),
);
const requirementRelations = RequirementRelationSeedRowsSchema.parse(
  readJson(
    '../../prisma/seed/relations/_FrameworkEditorControlTemplateToFrameworkEditorRequirement.json',
  ),
);

const nistRequirementRows = requirementSeedRows.filter(
  (row) => row.frameworkId === NIST_800_171_R3_FRAMEWORK_ID,
);
const nistRequirementIds = new Set(nistRequirementRows.map((row) => row.id));
const nistRequirementRelations = requirementRelations.filter((row) =>
  nistRequirementIds.has(row.B),
);

describe('nist-800-171-r3 seed coverage', () => {
  it('includes 97 unique seeded requirements', () => {
    assert.equal(nistRequirementRows.length, EXPECTED_REQUIREMENT_COUNT);
    assert.equal(
      new Set(nistRequirementRows.map((row) => row.identifier)).size,
      EXPECTED_REQUIREMENT_COUNT,
    );
    assert.equal(
      new Set(nistRequirementRows.map((row) => row.id)).size,
      EXPECTED_REQUIREMENT_COUNT,
    );
    assert.equal(
      nistRequirementRows.every((row) => row.description.trim().length > 0),
      true,
    );
  });

  it('uses deterministic requirement ids for seeded entries', () => {
    const requirement = nistRequirementRows.find((row) => row.identifier === '03.01.01');

    assert.ok(requirement);
    assert.equal(
      buildSeedId('frk_rq', 'framework:nist-800-171-rev-3:requirement:03.01.01'),
      EXPECTED_FIRST_REQUIREMENT_ID,
    );
    assert.equal(requirement.id, EXPECTED_FIRST_REQUIREMENT_ID);
    assert.equal(requirement.name, 'Account Management');
  });

  it('maps every NIST 800-171 Rev. 3 requirement to at least one control template', () => {
    assert.equal(nistRequirementRelations.length, EXPECTED_RELATION_COUNT);
    assert.equal(
      new Set(nistRequirementRelations.map((row) => `${row.A}:${row.B}`)).size,
      EXPECTED_RELATION_COUNT,
    );

    for (const requirement of nistRequirementRows) {
      const relationCount = nistRequirementRelations.filter(
        (row) => row.B === requirement.id,
      ).length;
      assert.ok(
        relationCount > 0,
        `Expected at least one control mapping for ${requirement.identifier}`,
      );
    }
  });
});
