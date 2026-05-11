import { createHash } from 'node:crypto';

export function buildSeedId(prefix: string, key: string): string {
  const normalizedPrefix = prefix.trim();
  const normalizedKey = key.trim();

  if (!normalizedPrefix) {
    throw new Error('Seed ID prefix is required.');
  }

  if (!normalizedKey) {
    throw new Error('Seed ID key is required.');
  }

  const digest = createHash('sha256').update(normalizedKey).digest('hex').slice(0, 24);
  return `${normalizedPrefix}_${digest}`;
}
