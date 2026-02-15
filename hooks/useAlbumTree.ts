import { fetchTreeLayouts } from '@/services/api/fetchTreeLayouts';
import { useQuery } from '@tanstack/react-query';

export const useAlbumTree = ({ eventToken }: { eventToken: string }) => {
  return useQuery<unknown>({
    // TODO: fix the type
    queryKey: ['fetch-album-tree', eventToken],
    queryFn: () => fetchTreeLayouts({ eventToken }),
  });
};
