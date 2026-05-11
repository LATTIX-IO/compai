'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
exports.db = void 0;

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const globalForPrisma = global;
const TRANSACTION_OPTIONS = {
  timeout: 60000,
};

function createClientWithAdapter(adapter) {
  return new PrismaClient({
    adapter,
    transactionOptions: TRANSACTION_OPTIONS,
  });
}

function stripSslMode(connectionString) {
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  return url.toString();
}

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL;
  const isLocalhost = /localhost|127\.0\.0\.1|::1/.test(rawUrl);

  if (isLocalhost) {
    return createClientWithAdapter(new PrismaPg(rawUrl));
  }

  const hasCABundle = !!process.env.NODE_EXTRA_CA_CERTS;
  const ssl = hasCABundle ? true : { rejectUnauthorized: false };
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

exports.db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = exports.db;
}
