import { fetchThemes } from '@/services/api/fetchThemes';
import { Themes } from '@/types/Themes';
import { QUERY_KEY } from '@/utils/appConst';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/stores/user';
import { useTranslationData } from '@/hooks/useTranslationData';
import useAlbumStore from '@/stores/album';
import { albumHasMagazineLayouts } from '@/lib/TreeV5/utils/layouts';

export const useThemes = () => {
  const { language } = useTranslationData();
  const album = useAlbumStore((state) => state.album);

  // Get layout family - simple check if album has magazine layouts
  const hasMagazineLayouts = albumHasMagazineLayouts();
  const layoutFamily = hasMagazineLayouts ? 'magazine' : 'regular';

  return useQuery<Themes>({
    queryKey: [
      QUERY_KEY.FETCH_USER_ALBUMS,
      album?.event_token,
      language,
      album?.format,
      album?.book_direction,
      album?.image_count,
      album?.density,
    ],
    queryFn: () => {
      const token = useUserStore.getState().user?.token || '';

      if (!album) {
        return Promise.reject({
          errorId: 'ALBUM_NOT_FOUND',
          message: 'The requested album could not be found.',
        });
      }
      return fetchThemes({
        token,
        event_token: album?.event_token,
        language,
        format: album.format,
        direction: album.book_direction,
        imageCount: album.image_count,
        density: album.density || layoutFamily,
      });
    },
  });
};
