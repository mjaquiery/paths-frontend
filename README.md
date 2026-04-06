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

## Fly.io deployment

Frontend deployment is automated through `.github/workflows/fly-deploy.yml`.

- Staging deploy: `fly deploy`
- Production deploy: `fly deploy --config fly.prod.toml`

`fly deploy` uses the default `fly.toml` configuration, which targets the staging app.
`fly deploy --config fly.prod.toml` uses the production Fly app configuration.

The GitHub workflow expects `FLY_API_TOKEN` in repository secrets.
