import { queryKeys } from '@/constants/query-keys';
import { fetchUserAlbums } from '@/services/api/fetch-user-albums';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';

export const useUserAlbums = () => {
  const token = useUserStore((state) => state.user?.token);

  return useQuery({
    queryKey: queryKeys.albums.list,
    queryFn: fetchUserAlbums,
    enabled: !!token,
  });
};
