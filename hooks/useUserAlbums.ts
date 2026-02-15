import { fetchUserAlbums } from '@/services/api/fetchUserAlbums';
import { Album } from '@/types/album';
import { QUERY_KEY } from '@/utils/appConst';
import { useQuery } from '@tanstack/react-query';

export const useUserAlbums = () => {
  return useQuery<Album[]>({
    queryKey: [QUERY_KEY.FETCH_USER_ALBUMS],
    queryFn: fetchUserAlbums,
  });
};
