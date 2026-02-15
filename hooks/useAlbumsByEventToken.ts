import { useQuery } from '@tanstack/react-query';
import { fetchAlbumsByEventToken } from '@/services/api/fetchAlbumsByEventToken';
import { QUERY_KEY } from '@/utils/appConst';

export interface UseAlbumsByEventTokenOptions {
  eventToken: string;
  enablePolling?: boolean;
  pollingInterval?: number;
  shouldFetch: boolean;
}

export const useAlbumsByEventToken = ({
  eventToken,
  enablePolling = false,
  pollingInterval = 5000,
  shouldFetch = true,
}: UseAlbumsByEventTokenOptions) => {
  return useQuery({
    queryKey: [QUERY_KEY.ALBUMS_BY_EVENT_TOKEN, eventToken],
    queryFn: () => fetchAlbumsByEventToken({ eventToken }),
    refetchInterval: enablePolling ? pollingInterval : false,
    refetchIntervalInBackground: enablePolling,
    enabled: !!eventToken && shouldFetch,
  });
};
