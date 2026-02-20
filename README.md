# paths-frontend

Ionic + Vue + Vite frontend for the Path-centric backend.

## Development

```bash
npm install
npm run codegen:openapi
npm run dev
```

## Build

```bash
npm run build
```

Required env:

- `VITE_API_BASE_URL` (e.g. `https://api.example.com`)

## OpenAPI code generation

`schema/openapi.json` is the source for generated frontend artifacts:

- `src/generated/types.ts`
- `src/generated/apiClient.ts`
- `src/generated/fixtures.ts`
- `src/generated/mswHandlers.ts`

Regenerate with:

```bash
npm run codegen:openapi
```

A PR CI job re-runs generation when `schema/openapi.json` changes and auto-commits any generated diffs.

## Storybook

```bash
npm run storybook
```

## Testing

```bash
npm run test
```
