import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  upsertRequestedFrameworkMetadata,
  type FrameworkSeedRow,
} from '../framework-catalog/requested-frameworks';

const frameworkSeedFilePath = resolve(
  __dirname,
  '../../prisma/seed/primitives/FrameworkEditorFramework.json',
);

function isFrameworkSeedRow(value: unknown): value is FrameworkSeedRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.version === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.visible === 'boolean'
  );
}

async function readFrameworkSeedRows(): Promise<FrameworkSeedRow[]> {
  const raw = await readFile(frameworkSeedFilePath, 'utf8');
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed) || !parsed.every(isFrameworkSeedRow)) {
    throw new Error('FrameworkEditorFramework.json must contain an array of framework seed rows.');
  }

  return parsed;
}

export async function syncRequestedFrameworkMetadata(options?: { checkOnly?: boolean }): Promise<{
  created: number;
  updated: number;
  verified: number;
}> {
  const checkOnly = options?.checkOnly ?? false;
  const currentFrameworks = await readFrameworkSeedRows();
  const result = upsertRequestedFrameworkMetadata(currentFrameworks);

  if (!checkOnly) {
    await writeFile(
      frameworkSeedFilePath,
      `${JSON.stringify(result.frameworks, null, 2)}\n`,
      'utf8',
    );
  }

  return {
    created: result.created,
    updated: result.updated,
    verified: result.verified,
  };
}

async function main(): Promise<void> {
  const checkOnly = process.argv.includes('--check');
  const result = await syncRequestedFrameworkMetadata({ checkOnly });
  const mode = checkOnly ? 'Verified' : 'Synced';

  console.log(
    `${mode} requested framework metadata in ${frameworkSeedFilePath} (${result.created} created, ${result.updated} updated, ${result.verified} verified).`,
  );
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
