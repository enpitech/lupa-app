import { useQuery } from '@tanstack/react-query';
import { fetchAlbumProgress } from '@/services/api/fetchAlbumProgress';
import { useUserStore } from '@/stores/user';
import { ALBUM_PROGRESS_STATUS, QUERY_KEY } from '@/utils/appConst';

interface AlbumProgressResponse {
  payload: {
    progress_status: string;
  };
}

interface UseAlbumProgressProps {
  event_token: string;
  pollingInterval: number;
  enabled?: boolean;
}

export const useAlbumProgress = ({
  event_token,
  pollingInterval = 50000,
  enabled = true,
}: UseAlbumProgressProps) => {
  return useQuery<AlbumProgressResponse>({
    queryKey: [QUERY_KEY.FETCH_ALBUM_PROGRESS, event_token],
    queryFn: () => {
      const token = useUserStore.getState().user?.token || '';
      return fetchAlbumProgress({ token, event_token });
    },
    enabled,
    refetchInterval: (data) =>
      ALBUM_PROGRESS_STATUS.COMPLETE_STATUSES.includes(
        data?.state?.data?.payload.progress_status ?? ''
      )
        ? false
        : pollingInterval,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
};
