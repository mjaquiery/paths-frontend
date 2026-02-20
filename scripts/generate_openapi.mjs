#!/usr/bin/env node
// Generates TypeScript API artifacts from schema/openapi.json.
//
// Types are generated via openapi-typescript (an established NPM library).
// The API client, fixtures, and MSW handlers are generated from the parsed
// spec using plain Node.js so the project has no Python dependency.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import openapiTS, { astToString, COMMENT_HEADER } from 'openapi-typescript';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SPEC_PATH = join(ROOT, 'schema', 'openapi.json');
const OUT_DIR = join(ROOT, 'src', 'generated');

// ---------------------------------------------------------------------------
// Helpers shared by client / fixture / MSW generation
// ---------------------------------------------------------------------------

function tsType(schema) {
  if (!schema) return 'unknown';
  if ('$ref' in schema) return schema.$ref.split('/').pop();
  if ('anyOf' in schema) {
    const variants = schema.anyOf.map(tsType);
    return [...new Set(variants)].join(' | ');
  }
  const t = schema.type;
  if (t === 'string') return 'string';
  if (t === 'integer' || t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  if (t === 'array') return `${tsType(schema.items ?? {})}[]`;
  if (t === 'object') {
    const props = schema.properties ?? {};
    if (!Object.keys(props).length) return 'Record<string, unknown>';
    const req = new Set(schema.required ?? []);
    const lines = ['{'];
    for (const [key, value] of Object.entries(props)) {
      lines.push(`  ${key}${req.has(key) ? '' : '?'}: ${tsType(value)};`);
    }
    lines.push('}');
    return lines.join('\n');
  }
  return 'unknown';
}

function qualifyClientType(typeName) {
  const primitives = new Set(['string', 'number', 'boolean', 'unknown', 'void', 'null', 'Record<string, unknown>']);
  if (primitives.has(typeName)) return typeName;
  if (typeName.endsWith('[]')) return `${qualifyClientType(typeName.slice(0, -2))}[]`;
  if (typeName.includes('|')) {
    return typeName.split('|').map((p) => qualifyClientType(p.trim())).join(' | ');
  }
  return `API.${typeName}`;
}

function schemaToClientType(schema) {
  if (!schema) return 'void';
  if ('$ref' in schema) return qualifyClientType(tsType(schema));
  if (schema.type === 'array') return qualifyClientType(tsType(schema));
  if (['string', 'number', 'integer', 'boolean'].includes(schema.type)) return qualifyClientType(tsType(schema));
  if ('anyOf' in schema) return qualifyClientType(tsType(schema));
  return 'unknown';
}

function opName(method, path, operation) {
  return (
    operation.operationId ??
    `${method}_${path.replace(/^\//, '').replace(/\//g, '_').replace(/[{}]/g, '')}`
  );
}

function pathToTemplate(path) {
  return path.replace(/\{(\w+)\}/g, '${params.$1}');
}

function responseType(operation) {
  for (const code of ['200', '201', '202']) {
    const schema = operation.responses?.[code]?.content?.['application/json']?.schema;
    if (schema) return schemaToClientType(schema);
  }
  return 'void';
}

function requestType(operation) {
  const schema = operation.requestBody?.content?.['application/json']?.schema;
  return schema ? schemaToClientType(schema) : null;
}

// ---------------------------------------------------------------------------
// API client generator
// ---------------------------------------------------------------------------

function generateClient(spec) {
  const lines = [
    "import type * as API from './types';",
    '',
    "const DEFAULT_API_BASE_URL = 'http://localhost:8000';",
    '',
    'export function createApiClient(baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL) {',
    '  const normalizedBase = baseUrl.replace(/\\/$/, "");',
    '  async function request<T>(path: string, init?: RequestInit): Promise<T> {',
    '    const response = await fetch(`${normalizedBase}${path}`, {',
    "      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },",
    '      ...init',
    '    });',
    '    if (!response.ok) throw new Error(`Request failed: ${response.status}`);',
    '    if (response.status === 204) return undefined as T;',
    '    return response.json() as Promise<T>;',
    '  }',
    '',
    '  return {',
  ];

  for (const path of Object.keys(spec.paths).sort()) {
    for (const method of Object.keys(spec.paths[path]).sort()) {
      if (method.startsWith('x-')) continue;
      const op = spec.paths[path][method];
      const name = opName(method, path, op);
      const pathParams = (op.parameters ?? []).filter((p) => p.in === 'path');
      const reqT = requestType(op);
      const respT = responseType(op);

      const paramsSig = [];
      if (pathParams.length) {
        paramsSig.push('params: { ' + pathParams.map((p) => `${p.name}: string`).join(', ') + ' }');
      }
      if (reqT) paramsSig.push(`body: ${reqT}`);

      const pathLiteral = pathParams.length ? `\`${pathToTemplate(path)}\`` : `'${path}'`;
      const requestInit = [`method: '${method.toUpperCase()}'`];
      if (reqT) requestInit.push('body: JSON.stringify(body)');

      lines.push(`    async ${name}(${paramsSig.join(', ')}): Promise<${respT}> {`);
      lines.push(`      return request<${respT}>(${pathLiteral}, { ${requestInit.join(', ')} });`);
      lines.push('    },');
    }
  }

  lines.push('  };', '}', '');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Fixtures generator
// ---------------------------------------------------------------------------

function defaultFixture(schema) {
  if (!schema) return null;
  if ('$ref' in schema) return null;
  if ('anyOf' in schema) return defaultFixture(schema.anyOf[0]);
  const t = schema.type;
  if (t === 'string') return schema.example ?? 'example';
  if (t === 'number' || t === 'integer') return schema.example ?? 0;
  if (t === 'boolean') return schema.example ?? false;
  if (t === 'array') return [defaultFixture(schema.items ?? {})];
  if (t === 'object') {
    return Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([k, v]) => [k, defaultFixture(v)]),
    );
  }
  return null;
}

function generateFixtures(spec) {
  const schemas = spec.components?.schemas ?? {};
  const lines = [
    "import type * as API from './types';",
    '',
  ];
  for (const name of Object.keys(schemas).sort()) {
    const constName = name[0].toLowerCase() + name.slice(1) + 'Fixture';
    const payload = JSON.stringify(defaultFixture(schemas[name]), null, 2);
    lines.push(`export const ${constName}: API.${name} = ${payload} as API.${name};`);
    lines.push('');
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// MSW handlers generator
// ---------------------------------------------------------------------------

function generateMsw(spec) {
  const lines = [
    "import { http, HttpResponse } from 'msw';",
    "import * as fixtures from './fixtures';",
    '',
    'export const generatedHandlers = [',
  ];

  for (const path of Object.keys(spec.paths).sort()) {
    for (const method of Object.keys(spec.paths[path]).sort()) {
      if (method.startsWith('x-')) continue;
      const op = spec.paths[path][method];
      const respT = responseType(op);
      const mswPath = path.replace(/\{(\w+)\}/g, ':$1');

      if (respT.startsWith('API.')) {
        const isArray = respT.endsWith('[]');
        const raw = respT.replace(/^API\./, '').replace(/\[\]$/, '');
        const fixtureName = raw[0].toLowerCase() + raw.slice(1) + 'Fixture';
        const body = isArray ? `[fixtures.${fixtureName}]` : `fixtures.${fixtureName}`;
        lines.push(`  http.${method}('${mswPath}', () => HttpResponse.json(${body})),`);
      } else {
        lines.push(`  http.${method}('${mswPath}', () => new HttpResponse(null, { status: 204 })),`);
      }
    }
  }

  lines.push('];', '');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const AUTO_GENERATED_HEADER = '// AUTO-GENERATED FILE. DO NOT EDIT.\n// Generated by scripts/generate_openapi.mjs from schema/openapi.json\n\n';

async function main() {
  const spec = JSON.parse(readFileSync(SPEC_PATH, 'utf8'));
  mkdirSync(OUT_DIR, { recursive: true });

  // types.ts — generated by openapi-typescript
  const nodes = await openapiTS(spec, {
    rootTypes: true,
    rootTypesNoSchemaPrefix: true,
    rootTypesKeepCasing: true,
  });
  writeFileSync(join(OUT_DIR, 'types.ts'), COMMENT_HEADER + astToString(nodes));

  // apiClient.ts
  writeFileSync(join(OUT_DIR, 'apiClient.ts'), AUTO_GENERATED_HEADER + generateClient(spec));

  // fixtures.ts
  writeFileSync(join(OUT_DIR, 'fixtures.ts'), AUTO_GENERATED_HEADER + generateFixtures(spec));

  // mswHandlers.ts
  writeFileSync(join(OUT_DIR, 'mswHandlers.ts'), AUTO_GENERATED_HEADER + generateMsw(spec));

  console.log('Generated OpenAPI artifacts in src/generated');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
