import { useQuery } from '@tanstack/vue-query';
import { listPathsV1PathsGet } from '../generated/apiClient';

export function usePaths() {
  return useQuery({
    queryKey: ['paths'],
    queryFn: async () => (await listPathsV1PathsGet()).data,
  });
}
