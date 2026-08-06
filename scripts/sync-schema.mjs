#!/usr/bin/env node
// Fetches the backend's live OpenAPI contract and vendors it into schema/openapi.json.
//
// BACKEND_ENV selects where from:
//   - "staging" / "production": the matching fly.io backend's live /openapi.json.
//     Note: today there is only one backend deployment (https://paths.fly.dev), so both
//     resolve to it. If a real staging/production split is stood up later, update the two
//     entries in KNOWN_ENVS below — everything else about this script stays the same.
//   - anything else: treated as a literal base URL (e.g. `http://localhost:8000` for a local
//     dev backend). This is a local-dev convenience only; CI always uses staging/production.
//
// Usage: BACKEND_ENV=staging node scripts/sync-schema.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const KNOWN_ENVS = {
  staging: 'https://paths.fly.dev',
  production: 'https://paths.fly.dev',
};

const SCHEMA_PATH = fileURLToPath(
  new URL('../schema/openapi.json', import.meta.url),
);

async function main() {
  const backendEnv = process.env.BACKEND_ENV;
  if (!backendEnv) {
    console.error(
      'BACKEND_ENV is required (e.g. "staging", "production", or a base URL).',
    );
    process.exitCode = 1;
    return;
  }

  const baseUrl = KNOWN_ENVS[backendEnv] ?? backendEnv;
  const url = `${baseUrl.replace(/\/+$/, '')}/openapi.json`;

  console.log(`Fetching OpenAPI schema from ${url} ...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }
  const schema = await response.json();

  const title = schema.info?.title ?? '';
  if (!title.toLowerCase().includes('paths')) {
    throw new Error(
      `Refusing to write schema: ${url} returned an OpenAPI doc titled "${title}", ` +
        "which doesn't look like the paths backend. Check BACKEND_ENV / that nothing " +
        'else is listening on that host:port.',
    );
  }

  await writeFile(SCHEMA_PATH, `${JSON.stringify(schema, null, 2)}\n`);
  console.log(
    `Wrote ${SCHEMA_PATH} (schema version ${schema.info?.version ?? 'unknown'}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
