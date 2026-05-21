import { existsSync } from 'fs';
import path from 'path';
import { register } from 'tsconfig-paths';

type RuntimePathAliasConfig = {
  baseUrl: string;
  paths: Record<string, string[]>;
};

export function getRuntimePathAliasConfig(
  currentDir: string = __dirname,
): RuntimePathAliasConfig {
  const runtimeBaseUrl = resolveRuntimeBaseUrl(currentDir);

  return {
    baseUrl: runtimeBaseUrl,
    paths: {
      '@db': ['prisma/index'],
      '@/*': ['src/*', 'dist/apps/api/src/*'],
    },
  };
}

export function resolveRuntimeBaseUrl(currentDir: string = __dirname): string {
  const candidates = [
    path.resolve(currentDir, '..', '..'),
    path.resolve(currentDir, '..', '..', '..', '..', '..'),
  ];

  return (
    candidates.find((candidate) =>
      existsSync(path.join(candidate, 'prisma', 'index.js')),
    ) ?? candidates[0]
  );
}

export function registerRuntimePathAliases(
  currentDir: string = __dirname,
): void {
  register(getRuntimePathAliasConfig(currentDir));
}

registerRuntimePathAliases();
