import { queryKeys } from '@/constants/query-keys';
import { fetchAlbumTree } from '@/services/api/fetch-album-tree';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';

export const useAlbumTree = ({ eventToken }: { eventToken: string }) => {
  const token = useUserStore((state) => state.user?.token);

  return useQuery({
    queryKey: queryKeys.albums.tree(eventToken),
    queryFn: () => fetchAlbumTree({ eventToken, token }),
    enabled: !!eventToken && !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.m_treeV5) return false;
      // Stop polling after ~30 seconds (10 attempts) to avoid infinite loop
      // for albums that are not currently being processed
      return query.state.dataUpdateCount < 10 ? 3000 : false;
    },
  });
};
