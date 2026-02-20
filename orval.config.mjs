/** @type {import('orval').Options} */
export default {
  pathsApi: {
    input: './schema/openapi.json',
    output: {
      client: 'fetch',
      target: './src/generated/apiClient.ts',
      schemas: './src/generated/types',
      mode: 'single',
      mock: true,
      override: {
        mutator: {
          path: './src/lib/customFetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
};
