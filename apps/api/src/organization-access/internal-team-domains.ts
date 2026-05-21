type EnvLike = Partial<Record<string, string | undefined>>;

function normalizeDomain(domain: string | undefined): string | undefined {
  const normalized = domain?.trim().toLowerCase().replace(/^@/, '');
  return normalized ? normalized : undefined;
}

export function getInternalTeamEmailDomains(
  env: EnvLike = process.env,
): string[] {
  return (env.INTERNAL_TEAM_EMAIL_DOMAINS ?? '')
    .split(',')
    .map((domain) => normalizeDomain(domain))
    .filter((domain): domain is string => Boolean(domain));
}

export function isInternalTeamEmailDomain(
  domain: string | undefined,
  env: EnvLike = process.env,
): boolean {
  const normalizedDomain = normalizeDomain(domain);

  if (!normalizedDomain) {
    return false;
  }

  return getInternalTeamEmailDomains(env).includes(normalizedDomain);
}
