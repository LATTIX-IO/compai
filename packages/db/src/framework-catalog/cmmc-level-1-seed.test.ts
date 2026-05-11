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

const CMMC_LEVEL_1_FRAMEWORK_ID = 'frk_682e2b8775e5e4b09fe5a01d';
const EXPECTED_IDENTIFIERS = [
  'AC.L1-b.1.i',
  'AC.L1-b.1.ii',
  'AC.L1-b.1.iii',
  'AC.L1-b.1.iv',
  'IA.L1-b.1.v',
  'IA.L1-b.1.vi',
  'MP.L1-b.1.vii',
  'PE.L1-b.1.viii',
  'PE.L1-b.1.ix',
  'SC.L1-b.1.x',
  'SC.L1-b.1.xi',
  'SI.L1-b.1.xii',
  'SI.L1-b.1.xiii',
  'SI.L1-b.1.xiv',
  'SI.L1-b.1.xv',
];
const EXPECTED_REQUIREMENT_COUNT = EXPECTED_IDENTIFIERS.length;
const EXPECTED_RELATION_COUNT = 36;
const EXPECTED_FIRST_REQUIREMENT_ID = 'frk_rq_57eb96089cd2e7fa0ce6fd4f';

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

const cmmcLevel1RequirementRows = requirementSeedRows.filter(
  (row) => row.frameworkId === CMMC_LEVEL_1_FRAMEWORK_ID,
);
const cmmcLevel1RequirementIds = new Set(cmmcLevel1RequirementRows.map((row) => row.id));
const cmmcLevel1RequirementRelations = requirementRelations.filter((row) =>
  cmmcLevel1RequirementIds.has(row.B),
);

describe('cmmc-level-1 seed coverage', () => {
  it('includes 15 unique seeded requirements', () => {
    assert.equal(cmmcLevel1RequirementRows.length, EXPECTED_REQUIREMENT_COUNT);
    assert.deepEqual(
      [...cmmcLevel1RequirementRows.map((row) => row.identifier)].sort(),
      [...EXPECTED_IDENTIFIERS].sort(),
    );
    assert.equal(
      new Set(cmmcLevel1RequirementRows.map((row) => row.id)).size,
      EXPECTED_REQUIREMENT_COUNT,
    );
    assert.equal(
      cmmcLevel1RequirementRows.every((row) => row.description.trim().length > 0),
      true,
    );
  });

  it('uses deterministic requirement ids for seeded entries', () => {
    for (const requirement of cmmcLevel1RequirementRows) {
      assert.equal(
        requirement.id,
        buildSeedId('frk_rq', `framework:cmmc-level-1:requirement:${requirement.identifier}`),
      );
    }

    const firstRequirement = cmmcLevel1RequirementRows.find(
      (row) => row.identifier === 'AC.L1-b.1.i',
    );

    assert.ok(firstRequirement);
    assert.equal(firstRequirement.id, EXPECTED_FIRST_REQUIREMENT_ID);
    assert.equal(firstRequirement.name, 'Authorized Users, Processes, and Devices');
  });

  it('maps every CMMC Level 1 requirement to at least one control template', () => {
    assert.equal(cmmcLevel1RequirementRelations.length, EXPECTED_RELATION_COUNT);
    assert.equal(
      new Set(cmmcLevel1RequirementRelations.map((row) => `${row.A}:${row.B}`)).size,
      EXPECTED_RELATION_COUNT,
    );

    for (const requirement of cmmcLevel1RequirementRows) {
      const relationCount = cmmcLevel1RequirementRelations.filter(
        (row) => row.B === requirement.id,
      ).length;
      assert.ok(
        relationCount > 0,
        `Expected at least one control mapping for ${requirement.identifier}`,
      );
    }
  });
});
