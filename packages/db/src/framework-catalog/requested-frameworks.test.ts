import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildRequestedFrameworkSeedRows,
  REQUESTED_FRAMEWORKS,
  upsertRequestedFrameworkMetadata,
  type FrameworkSeedRow,
} from './requested-frameworks';

describe('buildRequestedFrameworkSeedRows', () => {
  it('creates deterministic hidden metadata rows for every new framework request', () => {
    const rows = buildRequestedFrameworkSeedRows();

    assert.equal(rows.length, 8);
    assert.deepEqual(
      rows.map((row) => row.id),
      [
        'frk_651b5bc3da3877d883014ab6',
        'frk_beaa31e6b28f12693424057e',
        'frk_068c037257b80e088c80c4c9',
        'frk_4d3afeb33f6115241978c3dc',
        'frk_682e2b8775e5e4b09fe5a01d',
        'frk_3d3cab66a36ab3277a652dc3',
        'frk_041cd9baac0846c22201a570',
        'frk_df6d25307ba889ab61ba27bc',
      ],
    );
  });

  it('keeps all new framework metadata hidden by default', () => {
    const rows = buildRequestedFrameworkSeedRows();

    assert.equal(
      rows.every((row) => row.visible === false),
      true,
    );
  });
});

describe('upsertRequestedFrameworkMetadata', () => {
  it('creates missing requested framework rows and verifies ISO 27001 already exists', () => {
    const existingFrameworks: FrameworkSeedRow[] = [
      {
        id: 'frk_681ecc34e85064efdbb76993',
        name: 'ISO 27001',
        description: 'ISO 27001',
        version: '2022',
        createdAt: '2025-05-14 19:20:44.920',
        updatedAt: '2025-07-07 06:10:51.312',
        visible: true,
      },
    ];

    const result = upsertRequestedFrameworkMetadata(existingFrameworks);

    assert.equal(result.created, 8);
    assert.equal(result.updated, 0);
    assert.equal(result.verified, 1);
    assert.equal(result.frameworks.length, 9);
  });

  it('does not duplicate rows when requested frameworks already exist', () => {
    const requestedRows = buildRequestedFrameworkSeedRows();
    const existingFrameworks: FrameworkSeedRow[] = [
      {
        id: 'frk_681ecc34e85064efdbb76993',
        name: 'ISO 27001',
        description: 'ISO 27001',
        version: '2022',
        createdAt: '2025-05-14 19:20:44.920',
        updatedAt: '2025-07-07 06:10:51.312',
        visible: true,
      },
      ...requestedRows,
    ];

    const result = upsertRequestedFrameworkMetadata(existingFrameworks);

    assert.equal(result.created, 0);
    assert.equal(result.updated, 0);
    assert.equal(result.verified, 1);
    assert.equal(result.frameworks.length, existingFrameworks.length);
  });

  it('tracks ISO 27001 as a verify-only framework in the requested catalog list', () => {
    const iso27001 = REQUESTED_FRAMEWORKS.find((framework) => framework.name === 'ISO 27001');

    assert.equal(iso27001?.action, 'verify-existing');
    assert.equal(iso27001?.existingId, 'frk_681ecc34e85064efdbb76993');
  });
});
