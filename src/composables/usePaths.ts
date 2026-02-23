import { useListPaths } from '../generated/apiClient';

export function usePaths() {
  return useListPaths({
    query: {
      select: (r) => r.data,
    },
  });
}
