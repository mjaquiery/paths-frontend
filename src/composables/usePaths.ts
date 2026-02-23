import { useQuery } from '@tanstack/vue-query';
import { listPaths } from '../generated/apiClient';

export function usePaths() {
  return useQuery({
    queryKey: ['v1', 'paths'],
    queryFn: async () => (await listPaths()).data,
  });
}
