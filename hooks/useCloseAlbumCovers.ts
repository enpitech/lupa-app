import { closeAlbumCovers } from '@/services/api/closeAlbumCovers';
import { PhotoAlbum } from '@/types/tree';
import { QUERY_KEY } from '@/utils/appConst';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useCloseAlbumCovers = ({
  eventToken,
  setCovers,
}: {
  eventToken: string;
  setCovers: (album: PhotoAlbum) => void;
}) => {
  const query = useQuery({
    queryKey: [QUERY_KEY.FETCH_BOOK_COVER, eventToken],
    queryFn: () => closeAlbumCovers(eventToken),
    enabled: !!eventToken,
  });

  useEffect(() => {
    if (query.isSuccess && setCovers && query.data?.payload) {
      setCovers(query.data.payload);
    }
  }, [query.isSuccess, query.data, setCovers]);

  return query;
};
