import type { NextFunction, Request, Response } from 'express';
import { getAuth } from './auth.server';

type BetterAuthNodeHandler = ReturnType<
  (typeof import('better-auth/node'))['toNodeHandler']
>;

type LoadedAuthHandler = {
  basePath: string;
  handler: BetterAuthNodeHandler;
};

let authHandlerPromise: Promise<LoadedAuthHandler> | null = null;

function matchesBasePath(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

async function loadAuthHandler(): Promise<LoadedAuthHandler> {
  if (!authHandlerPromise) {
    authHandlerPromise = Promise.all([import('better-auth/node'), getAuth()])
      .then(([{ toNodeHandler }, authInstance]) => ({
        basePath: authInstance.options.basePath ?? '/api/auth',
        handler: toNodeHandler(authInstance),
      }))
      .catch((error: unknown) => {
        authHandlerPromise = null;
        throw error;
      });
  }

  return authHandlerPromise;
}

/**
 * Mount Better Auth directly on the Express adapter.
 *
 * We intentionally avoid `@thallesp/nestjs-better-auth` here because Vercel
 * runs the compiled Nest app as CommonJS, while that Nest adapter package is
 * ESM-only and crashes at runtime with `ERR_REQUIRE_ESM`.
 */
export async function betterAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { basePath, handler } = await loadAuthHandler();

    if (!matchesBasePath(req.path, basePath)) {
      next();
      return;
    }

    await handler(req, res);
  } catch (error) {
    next(error);
  }
}