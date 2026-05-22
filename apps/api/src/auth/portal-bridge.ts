const HTML_ESCAPE_LOOKUP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPE_LOOKUP[character]);
}

export function normalizePortalBridgePath(value?: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}

export function normalizePortalBridgeOrigin(value: string): string {
  const url = new URL(value);

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Portal origin must use http or https.');
  }

  return url.origin;
}

export function buildPortalBridgeHtml(input: {
  portalSessionUrl: string;
  sessionToken: string;
  expiresAt?: string;
  nextPath: string;
}): string {
  const hiddenInputs = [
    ['sessionToken', input.sessionToken],
    ['next', input.nextPath],
    ...(input.expiresAt ? [['expiresAt', input.expiresAt]] : []),
  ]
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Completing sign-in...</title>
  </head>
  <body>
    <form id="portal-bridge-form" method="post" action="${escapeHtml(input.portalSessionUrl)}">
      ${hiddenInputs}
      <noscript>
        <p>JavaScript is required to finish signing in.</p>
        <button type="submit">Continue</button>
      </noscript>
    </form>
    <script>
      document.getElementById('portal-bridge-form')?.submit();
    </script>
  </body>
</html>`;
}

export function buildPortalBridgeContentSecurityPolicy(
  portalOrigin: string,
): string {
  return [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self'",
    "form-action 'self' " + portalOrigin,
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
  ].join('; ');
}