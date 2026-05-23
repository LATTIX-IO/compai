describe('better auth middleware wiring (structural)', () => {
  it('auth.module should not import the ESM-only Nest adapter', () => {
    const fs = require('fs');
    const path = require('path');
    const authModule = fs.readFileSync(
      path.join(__dirname, 'auth.module.ts'),
      'utf-8',
    ) as string;

    expect(authModule).not.toContain('@thallesp/nestjs-better-auth');
    expect(authModule).not.toContain('BetterAuthModule.forRoot');
  });

  it('better-auth.middleware should lazy-load better-auth/node', () => {
    const fs = require('fs');
    const path = require('path');
    const middleware = fs.readFileSync(
      path.join(__dirname, 'better-auth.middleware.ts'),
      'utf-8',
    ) as string;

    expect(middleware).toContain("import('better-auth/node')");
    expect(middleware).toContain('getAuth()');
    expect(middleware).toContain("authInstance.options.basePath ?? '/api/auth'");
  });

  it('main.ts should mount betterAuthMiddleware on the Express app', () => {
    const fs = require('fs');
    const path = require('path');
    const mainTs = fs.readFileSync(
      path.join(__dirname, '..', 'main.ts'),
      'utf-8',
    ) as string;

    expect(mainTs).toContain(
      "import { betterAuthMiddleware } from './auth/better-auth.middleware'",
    );
    expect(mainTs).toContain('void betterAuthMiddleware(req, res, next)');
  });

  it('main.ts should import fflate so jsPDF works in the serverless bundle', () => {
    const fs = require('fs');
    const path = require('path');
    const mainTs = fs.readFileSync(
      path.join(__dirname, '..', 'main.ts'),
      'utf-8',
    ) as string;

    expect(mainTs).toContain("import 'fflate';");
  });
});