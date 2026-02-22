import { queryKeys } from '@/constants/query-keys';
import { fetchEpilogProlog } from '@/services/api/fetch-epilog-prolog';
import { useQuery } from '@tanstack/react-query';

export const useEpilogProlog = ({
  eventToken,
  isEpilog,
  enabled = true,
}: {
  eventToken: string;
  isEpilog: boolean;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: queryKeys.albums.epilogProlog(eventToken, isEpilog),
    queryFn: () => fetchEpilogProlog({ eventToken, isEpilog }),
    enabled: enabled && !!eventToken,
    staleTime: 10 * 60 * 1000,
  });
};
