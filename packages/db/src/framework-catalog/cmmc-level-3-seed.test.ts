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

const CMMC_LEVEL_3_FRAMEWORK_ID = 'frk_041cd9baac0846c22201a570';
const EXPECTED_REQUIREMENT_COUNT = 24;
const EXPECTED_FIRST_REQUIREMENT_ID = 'frk_rq_6db918ca224e9e6af8cfe777';
const EXPECTED_IDENTIFIERS = `
AC.L3-3.1.2e
AC.L3-3.1.3e
AT.L3-3.2.1e
AT.L3-3.2.2e
CM.L3-3.4.1e
CM.L3-3.4.2e
CM.L3-3.4.3e
IA.L3-3.5.1e
IA.L3-3.5.3e
IR.L3-3.6.1e
IR.L3-3.6.2e
PS.L3-3.9.2e
RA.L3-3.11.1e
RA.L3-3.11.2e
RA.L3-3.11.3e
RA.L3-3.11.4e
RA.L3-3.11.5e
RA.L3-3.11.6e
RA.L3-3.11.7e
CA.L3-3.12.1e
SC.L3-3.13.4e
SI.L3-3.14.1e
SI.L3-3.14.3e
SI.L3-3.14.6e
`
  .trim()
  .split(/\s+/);

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

const cmmcLevel3RequirementRows = requirementSeedRows.filter(
  (row) => row.frameworkId === CMMC_LEVEL_3_FRAMEWORK_ID,
);
const cmmcLevel3RequirementIds = new Set(cmmcLevel3RequirementRows.map((row) => row.id));
const cmmcLevel3RequirementRelations = requirementRelations.filter((row) =>
  cmmcLevel3RequirementIds.has(row.B),
);

describe('cmmc-level-3 seed coverage', () => {
  it('includes 24 unique seeded requirements', () => {
    assert.equal(cmmcLevel3RequirementRows.length, EXPECTED_REQUIREMENT_COUNT);
    assert.deepEqual(
      [...cmmcLevel3RequirementRows.map((row) => row.identifier)].sort(),
      [...EXPECTED_IDENTIFIERS].sort(),
    );
    assert.equal(
      new Set(cmmcLevel3RequirementRows.map((row) => row.id)).size,
      EXPECTED_REQUIREMENT_COUNT,
    );
    assert.equal(
      cmmcLevel3RequirementRows.every((row) => row.description.trim().length > 0),
      true,
    );
  });

  it('uses deterministic requirement ids and stable sample names', () => {
    for (const requirement of cmmcLevel3RequirementRows) {
      assert.equal(
        requirement.id,
        buildSeedId('frk_rq', `framework:cmmc-level-3:requirement:${requirement.identifier}`),
      );
    }

    const firstRequirement = cmmcLevel3RequirementRows.find(
      (row) => row.identifier === 'AC.L3-3.1.2e',
    );
    const securityOperationsCenterRequirement = cmmcLevel3RequirementRows.find(
      (row) => row.identifier === 'IR.L3-3.6.1e',
    );
    const solutionRationaleRequirement = cmmcLevel3RequirementRows.find(
      (row) => row.identifier === 'RA.L3-3.11.4e',
    );

    assert.ok(firstRequirement);
    assert.equal(firstRequirement.id, EXPECTED_FIRST_REQUIREMENT_ID);
    assert.equal(firstRequirement.name, 'Organization-Provisioned Resource Access');

    assert.ok(securityOperationsCenterRequirement);
    assert.equal(securityOperationsCenterRequirement.name, 'Security Operations Center');

    assert.ok(solutionRationaleRequirement);
    assert.equal(solutionRationaleRequirement.name, 'Security Solution Rationale');
  });

  it('maps every CMMC Level 3 requirement to at least one control template', () => {
    assert.ok(cmmcLevel3RequirementRelations.length >= EXPECTED_REQUIREMENT_COUNT);
    assert.equal(
      new Set(cmmcLevel3RequirementRelations.map((row) => `${row.A}:${row.B}`)).size,
      cmmcLevel3RequirementRelations.length,
    );

    for (const requirement of cmmcLevel3RequirementRows) {
      const relationCount = cmmcLevel3RequirementRelations.filter(
        (row) => row.B === requirement.id,
      ).length;
      assert.ok(
        relationCount > 0,
        `Expected at least one control mapping for ${requirement.identifier}`,
      );
    }
  });
});
