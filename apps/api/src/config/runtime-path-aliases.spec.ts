import path from 'path';
import {
  getRuntimePathAliasConfig,
  resolveRuntimeBaseUrl,
} from './runtime-path-aliases';

describe('getRuntimePathAliasConfig', () => {
  it('maps runtime aliases relative to the source api root', () => {
    const config = getRuntimePathAliasConfig(
      path.join('d:', 'lattix', 'compai', 'apps', 'api', 'src', 'config'),
    );

    expect(config).toEqual({
      baseUrl: path.join('d:', 'lattix', 'compai', 'apps', 'api'),
      paths: {
        '@db': ['prisma/index'],
        '@/*': ['src/*', 'dist/apps/api/src/*'],
      },
    });
  });

  it('falls back from the dist layout to the api root that contains prisma/index.js', () => {
    const distConfigDir = path.join(
      'd:',
      'lattix',
      'compai',
      'apps',
      'api',
      'dist',
      'apps',
      'api',
      'src',
      'config',
    );

    expect(resolveRuntimeBaseUrl(distConfigDir)).toBe(
      path.join('d:', 'lattix', 'compai', 'apps', 'api'),
    );
  });
});
