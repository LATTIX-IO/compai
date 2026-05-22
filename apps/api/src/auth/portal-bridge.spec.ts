import {
  buildPortalBridgeContentSecurityPolicy,
  buildPortalBridgeHtml,
  normalizePortalBridgeOrigin,
  normalizePortalBridgePath,
} from './portal-bridge';

describe('portal bridge helpers', () => {
  it('normalizes safe internal redirect paths', () => {
    expect(normalizePortalBridgePath('/')).toBe('/');
    expect(normalizePortalBridgePath('/org_123')).toBe('/org_123');
    expect(normalizePortalBridgePath('https://example.com')).toBe('/');
    expect(normalizePortalBridgePath('//example.com')).toBe('/');
  });

  it('normalizes the portal origin and rejects unsupported schemes', () => {
    expect(
      normalizePortalBridgeOrigin('https://compai-lattix.vercel.app/auth'),
    ).toBe('https://compai-lattix.vercel.app');

    expect(() => normalizePortalBridgeOrigin('javascript:alert(1)')).toThrow(
      'Portal origin must use http or https.',
    );
  });

  it('builds an auto-submitting bridge document with escaped values', () => {
    const html = buildPortalBridgeHtml({
      portalSessionUrl:
        'https://compai-lattix.vercel.app/api/auth/portal-session',
      sessionToken: 'ses_<unsafe>',
      expiresAt: '2026-05-22T00:00:00.000Z',
      nextPath: '/org_123?from=portal',
    });

    expect(html).toContain('id="portal-bridge-form"');
    expect(html).toContain(
      'action="https://compai-lattix.vercel.app/api/auth/portal-session"',
    );
    expect(html).toContain('name="sessionToken" value="ses_&lt;unsafe&gt;"');
    expect(html).toContain('name="next" value="/org_123?from=portal"');
    expect(html).toContain(
      "document.getElementById('portal-bridge-form')?.submit();",
    );
  });

  it('builds a csp that allows the trusted portal handoff form post', () => {
    const policy = buildPortalBridgeContentSecurityPolicy(
      'https://compai-lattix.vercel.app',
    );

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain(
      "form-action 'self' https://compai-lattix.vercel.app",
    );
    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).toContain("frame-ancestors 'none'");
  });
});
