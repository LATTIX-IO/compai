import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import {
  OPEN_MICROSOFT_TENANT_IDS,
  SUPPORTED_AUTH_PROVIDERS,
} from '../auth/auth-deployment.config';

const betterAuthConfigSchema = z.object({
  url: z.string().url('BASE_URL must be a valid URL'),
  cookieDomain: z
    .string()
    .regex(
      /^\.[a-zA-Z0-9.-]+$/,
      'AUTH_COOKIE_DOMAIN must start with a leading dot, e.g. .example.com',
    )
    .optional(),
  enforcedProvider: z.enum(SUPPORTED_AUTH_PROVIDERS).optional(),
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
  githubClientId: z.string().optional(),
  githubClientSecret: z.string().optional(),
  microsoftClientId: z.string().optional(),
  microsoftClientSecret: z.string().optional(),
  microsoftTenantId: z.string().optional(),
}).superRefine((config, ctx) => {
  if (config.enforcedProvider === 'google') {
    if (!config.googleClientId || !config.googleClientSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['googleClientId'],
        message:
          'AUTH_ENFORCED_PROVIDER=google requires AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET.',
      });
    }

    return;
  }

  if (config.enforcedProvider === 'github') {
    if (!config.githubClientId || !config.githubClientSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['githubClientId'],
        message:
          'AUTH_ENFORCED_PROVIDER=github requires AUTH_GITHUB_ID and AUTH_GITHUB_SECRET.',
      });
    }

    return;
  }

  if (config.enforcedProvider === 'microsoft') {
    if (!config.microsoftClientId || !config.microsoftClientSecret) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['microsoftClientId'],
        message:
          'AUTH_ENFORCED_PROVIDER=microsoft requires AUTH_MICROSOFT_CLIENT_ID and AUTH_MICROSOFT_CLIENT_SECRET.',
      });
    }

    const tenantId = config.microsoftTenantId?.trim().toLowerCase();

    if (!tenantId || OPEN_MICROSOFT_TENANT_IDS.has(tenantId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['microsoftTenantId'],
        message:
          'AUTH_ENFORCED_PROVIDER=microsoft requires AUTH_MICROSOFT_TENANT_ID to be set to a specific Entra tenant ID.',
      });
    }
  }
});

export type BetterAuthConfig = z.infer<typeof betterAuthConfigSchema>;

/**
 * Better Auth configuration for the API.
 *
 * BASE_URL should point to the API itself since the API is the auth server.
 * AUTH_COOKIE_DOMAIN can be set for cross-subdomain cookies on internal domains.
 * AUTH_ENFORCED_PROVIDER can lock sign-in to a single social provider.
 * For example:
 * - Production: https://api.trycomp.ai
 * - Staging: https://api.staging.trycomp.ai
 * - Development: http://localhost:3333
 */
export const betterAuthConfig = registerAs(
  'betterAuth',
  (): BetterAuthConfig => {
    const url = process.env.BASE_URL;

    if (!url) {
      throw new Error('BASE_URL environment variable is required');
    }

    const config = {
      url,
      cookieDomain: process.env.AUTH_COOKIE_DOMAIN,
      enforcedProvider: process.env.AUTH_ENFORCED_PROVIDER,
      googleClientId: process.env.AUTH_GOOGLE_ID,
      googleClientSecret: process.env.AUTH_GOOGLE_SECRET,
      githubClientId: process.env.AUTH_GITHUB_ID,
      githubClientSecret: process.env.AUTH_GITHUB_SECRET,
      microsoftClientId: process.env.AUTH_MICROSOFT_CLIENT_ID,
      microsoftClientSecret: process.env.AUTH_MICROSOFT_CLIENT_SECRET,
      microsoftTenantId: process.env.AUTH_MICROSOFT_TENANT_ID,
    };

    const result = betterAuthConfigSchema.safeParse(config);

    if (!result.success) {
      throw new Error(
        `Better Auth configuration validation failed: ${result.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
      );
    }

    return result.data;
  },
);
