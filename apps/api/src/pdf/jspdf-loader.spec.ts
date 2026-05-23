describe('jspdf loader wiring (structural)', () => {
  const fs = require('fs');
  const path = require('path');
  const srcDir = path.join(__dirname, '..');

  it('jspdf-loader should load jspdf on demand', () => {
    const loader = fs.readFileSync(
      path.join(__dirname, 'jspdf-loader.ts'),
      'utf-8',
    ) as string;

    expect(loader).toContain("require('jspdf')");
    expect(loader).toContain('export function getJsPDF()');
  });

  it.each([
    path.join(srcDir, 'questionnaire', 'utils', 'export-generator.ts'),
    path.join(srcDir, 'soa', 'utils', 'export-generator.ts'),
    path.join(srcDir, 'training', 'training-certificate-pdf.service.ts'),
    path.join(srcDir, 'trust-portal', 'policy-pdf-renderer.service.ts'),
    path.join(
      srcDir,
      'tasks',
      'evidence-export',
      'evidence-pdf-generator.ts',
    ),
  ])('%s should use the shared lazy jspdf loader', (filePath: string) => {
    const source = fs.readFileSync(filePath, 'utf-8') as string;

    expect(source).toContain('getJsPDF');
    expect(source).not.toContain("import { jsPDF } from 'jspdf'");
    expect(source).not.toContain('new jsPDF(');
  });
});