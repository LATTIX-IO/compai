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

const CMMC_LEVEL_2_FRAMEWORK_ID = 'frk_3d3cab66a36ab3277a652dc3';
const EXPECTED_REQUIREMENT_COUNT = 110;
const EXPECTED_FIRST_REQUIREMENT_ID = 'frk_rq_6ecf1347812377503c4e1282';
const EXPECTED_IDENTIFIERS = `
AC.L2-3.1.1
AC.L2-3.1.2
AC.L2-3.1.3
AC.L2-3.1.4
AC.L2-3.1.5
AC.L2-3.1.6
AC.L2-3.1.7
AC.L2-3.1.8
AC.L2-3.1.9
AC.L2-3.1.10
AC.L2-3.1.11
AC.L2-3.1.12
AC.L2-3.1.13
AC.L2-3.1.14
AC.L2-3.1.15
AC.L2-3.1.16
AC.L2-3.1.17
AC.L2-3.1.18
AC.L2-3.1.19
AC.L2-3.1.20
AC.L2-3.1.21
AC.L2-3.1.22
AT.L2-3.2.1
AT.L2-3.2.2
AT.L2-3.2.3
AU.L2-3.3.1
AU.L2-3.3.2
AU.L2-3.3.3
AU.L2-3.3.4
AU.L2-3.3.5
AU.L2-3.3.6
AU.L2-3.3.7
AU.L2-3.3.8
AU.L2-3.3.9
CM.L2-3.4.1
CM.L2-3.4.2
CM.L2-3.4.3
CM.L2-3.4.4
CM.L2-3.4.5
CM.L2-3.4.6
CM.L2-3.4.7
CM.L2-3.4.8
CM.L2-3.4.9
IA.L2-3.5.1
IA.L2-3.5.2
IA.L2-3.5.3
IA.L2-3.5.4
IA.L2-3.5.5
IA.L2-3.5.6
IA.L2-3.5.7
IA.L2-3.5.8
IA.L2-3.5.9
IA.L2-3.5.10
IA.L2-3.5.11
IR.L2-3.6.1
IR.L2-3.6.2
IR.L2-3.6.3
MA.L2-3.7.1
MA.L2-3.7.2
MA.L2-3.7.3
MA.L2-3.7.4
MA.L2-3.7.5
MA.L2-3.7.6
MP.L2-3.8.1
MP.L2-3.8.2
MP.L2-3.8.3
MP.L2-3.8.4
MP.L2-3.8.5
MP.L2-3.8.6
MP.L2-3.8.7
MP.L2-3.8.8
MP.L2-3.8.9
PS.L2-3.9.1
PS.L2-3.9.2
PE.L2-3.10.1
PE.L2-3.10.2
PE.L2-3.10.3
PE.L2-3.10.4
PE.L2-3.10.5
PE.L2-3.10.6
RA.L2-3.11.1
RA.L2-3.11.2
RA.L2-3.11.3
CA.L2-3.12.1
CA.L2-3.12.2
CA.L2-3.12.3
CA.L2-3.12.4
SC.L2-3.13.1
SC.L2-3.13.2
SC.L2-3.13.3
SC.L2-3.13.4
SC.L2-3.13.5
SC.L2-3.13.6
SC.L2-3.13.7
SC.L2-3.13.8
SC.L2-3.13.9
SC.L2-3.13.10
SC.L2-3.13.11
SC.L2-3.13.12
SC.L2-3.13.13
SC.L2-3.13.14
SC.L2-3.13.15
SC.L2-3.13.16
SI.L2-3.14.1
SI.L2-3.14.2
SI.L2-3.14.3
SI.L2-3.14.4
SI.L2-3.14.5
SI.L2-3.14.6
SI.L2-3.14.7
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

const cmmcLevel2RequirementRows = requirementSeedRows.filter(
  (row) => row.frameworkId === CMMC_LEVEL_2_FRAMEWORK_ID,
);
const cmmcLevel2RequirementIds = new Set(cmmcLevel2RequirementRows.map((row) => row.id));
const cmmcLevel2RequirementRelations = requirementRelations.filter((row) =>
  cmmcLevel2RequirementIds.has(row.B),
);

describe('cmmc-level-2 seed coverage', () => {
  it('includes 110 unique seeded requirements', () => {
    assert.equal(cmmcLevel2RequirementRows.length, EXPECTED_REQUIREMENT_COUNT);
    assert.deepEqual(
      [...cmmcLevel2RequirementRows.map((row) => row.identifier)].sort(),
      [...EXPECTED_IDENTIFIERS].sort(),
    );
    assert.equal(
      new Set(cmmcLevel2RequirementRows.map((row) => row.id)).size,
      EXPECTED_REQUIREMENT_COUNT,
    );
    assert.equal(
      cmmcLevel2RequirementRows.every((row) => row.description.trim().length > 0),
      true,
    );
  });

  it('uses deterministic requirement ids and stable sample names', () => {
    for (const requirement of cmmcLevel2RequirementRows) {
      assert.equal(
        requirement.id,
        buildSeedId('frk_rq', `framework:cmmc-level-2:requirement:${requirement.identifier}`),
      );
    }

    const firstRequirement = cmmcLevel2RequirementRows.find(
      (row) => row.identifier === 'AC.L2-3.1.1',
    );
    const insiderThreatRequirement = cmmcLevel2RequirementRows.find(
      (row) => row.identifier === 'AT.L2-3.2.3',
    );
    const systemSecurityPlanRequirement = cmmcLevel2RequirementRows.find(
      (row) => row.identifier === 'CA.L2-3.12.4',
    );

    assert.ok(firstRequirement);
    assert.equal(firstRequirement.id, EXPECTED_FIRST_REQUIREMENT_ID);
    assert.equal(firstRequirement.name, 'Account Management');

    assert.ok(insiderThreatRequirement);
    assert.equal(insiderThreatRequirement.name, 'Insider Threat Awareness');

    assert.ok(systemSecurityPlanRequirement);
    assert.equal(systemSecurityPlanRequirement.name, 'System Security Plans');
  });

  it('maps every CMMC Level 2 requirement to at least one control template', () => {
    assert.ok(cmmcLevel2RequirementRelations.length >= EXPECTED_REQUIREMENT_COUNT);
    assert.equal(
      new Set(cmmcLevel2RequirementRelations.map((row) => `${row.A}:${row.B}`)).size,
      cmmcLevel2RequirementRelations.length,
    );

    for (const requirement of cmmcLevel2RequirementRows) {
      const relationCount = cmmcLevel2RequirementRelations.filter(
        (row) => row.B === requirement.id,
      ).length;
      assert.ok(
        relationCount > 0,
        `Expected at least one control mapping for ${requirement.identifier}`,
      );
    }
  });
});
