import type { DotenvConfigOptions, DotenvConfigOutput } from 'dotenv';

const mockConfig = jest.fn<
  (options?: DotenvConfigOptions) => DotenvConfigOutput
>();
const mockExistsSync = jest.fn<(path: string) => boolean>();

jest.mock('dotenv', () => ({
  config: mockConfig,
}));

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
}));

describe('load-env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    mockConfig.mockReset();
    mockExistsSync.mockReset();
    process.env = { ...originalEnv };
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('loads the first existing env file without overriding existing process env values', () => {
    mockExistsSync.mockReturnValueOnce(true);

    jest.isolateModules(() => {
      require('./load-env');
    });

    expect(mockExistsSync).toHaveBeenCalled();
    expect(mockConfig).toHaveBeenCalledWith(
      expect.objectContaining({ override: false }),
    );
  });

  it('skips file-based env loading on vercel runtimes', () => {
    process.env.VERCEL = '1';
    mockExistsSync.mockReturnValue(true);

    jest.isolateModules(() => {
      require('./load-env');
    });

    expect(mockExistsSync).not.toHaveBeenCalled();
    expect(mockConfig).not.toHaveBeenCalled();
  });
});