describe('mammoth loader wiring (structural)', () => {
  const fs = require('fs');
  const path = require('path');
  const srcDir = path.join(__dirname, '..');

  it('mammoth-loader should lazy-load mammoth and underscore', () => {
    const loader = fs.readFileSync(
      path.join(__dirname, 'mammoth-loader.ts'),
      'utf-8',
    ) as string;

    expect(loader).toContain("require('underscore')");
    expect(loader).toContain("require('mammoth')");
    expect(loader).toContain('export function getMammoth()');
  });

  it.each([
    path.join(srcDir, 'questionnaire', 'utils', 'content-extractor.ts'),
    path.join(
      srcDir,
      'trigger',
      'vector-store',
      'helpers',
      'extract-content-from-file.ts',
    ),
  ])('%s should use the shared lazy mammoth loader', (filePath: string) => {
    const source = fs.readFileSync(filePath, 'utf-8') as string;

    expect(source).toContain('getMammoth');
    expect(source).not.toContain("import mammoth from 'mammoth'");
  });
});