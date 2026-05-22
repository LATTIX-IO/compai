import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

let envLoaded = false;

const searchPaths = [
  // When compiled to dist/src (Nest build output)
  path.join(__dirname, '..', '..', '.env'),
  // When running with ts-node directly from src
  path.join(__dirname, '..', '.env'),
  // Fallback to current working directory
  path.join(process.cwd(), '.env'),
];

function shouldLoadEnvFromFile(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.VERCEL === '1') {
    return false;
  }

  if (env.NODE_ENV === 'production' && (env.VERCEL_ENV || env.VERCEL_URL)) {
    return false;
  }

  return true;
}

function loadEnv(): void {
  if (!shouldLoadEnvFromFile()) {
    envLoaded = true;
    return;
  }

  for (const envPath of searchPaths) {
    if (existsSync(envPath)) {
      config({ path: envPath, override: false });
      envLoaded = true;
      return;
    }
  }
  envLoaded = true;
}

if (!envLoaded) {
  loadEnv();
}

export function ensureEnvLoaded(): void {
  if (!envLoaded) {
    loadEnv();
  }
}
