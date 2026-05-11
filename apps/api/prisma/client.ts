import type { PrismaClient as PrismaClientInstance } from '@prisma/client';
import type { PrismaPg as PrismaPgAdapter } from '@prisma/adapter-pg';

const { PrismaClient } =
  require('@prisma/client') as typeof import('@prisma/client');
const { PrismaPg } =
  require('@prisma/adapter-pg') as typeof import('@prisma/adapter-pg');

const globalForPrisma = global as unknown as { prisma: PrismaClientInstance };
const TRANSACTION_OPTIONS = {
  timeout: 60000,
};

function createClientWithAdapter(
  adapter: PrismaPgAdapter,
): PrismaClientInstance {
  return new PrismaClient({
    adapter,
    transactionOptions: TRANSACTION_OPTIONS,
  });
}

function stripSslMode(connectionString: string): string {
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  return url.toString();
}

function createPrismaClient(): PrismaClientInstance {
  const rawUrl = process.env.DATABASE_URL!;
  const isLocalhost = /localhost|127\.0\.0\.1|::1/.test(rawUrl);

  if (isLocalhost) {
    return createClientWithAdapter(new PrismaPg(rawUrl));
  }

  // Use verified SSL when NODE_EXTRA_CA_CERTS is set (Docker with RDS CA bundle),
  // otherwise fall back to unverified SSL (Trigger.dev, Vercel, other environments).
  const hasCABundle = !!process.env.NODE_EXTRA_CA_CERTS;
  const ssl = hasCABundle ? true : { rejectUnauthorized: false };
  // Strip sslmode from the connection string to avoid conflicts with the explicit ssl option
  const url = stripSslMode(rawUrl);

  try {
    return createClientWithAdapter(
      new PrismaPg({ connectionString: url, ssl }),
    );
  } catch (error) {
    console.warn(
      '[prisma] Failed to initialize PrismaPg adapter with explicit SSL config, retrying with the raw connection string',
      error,
    );

    return createClientWithAdapter(new PrismaPg(rawUrl));
  }
}

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
