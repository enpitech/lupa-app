import { fetchEpilogProlog } from '@/services/api/fetchEpilogProlog';
import { QUERY_KEY } from '@/utils/appConst';
import { useQuery } from '@tanstack/react-query';

interface UseGetEpilogPrologParams {
  eventToken: string;
  lang: string;
  isEpilog: boolean;
  enabled?: boolean;
}

export const useGetEpilogProlog = ({
  eventToken,
  lang,
  isEpilog,
  enabled = true,
}: UseGetEpilogPrologParams) => {
  return useQuery({
    queryKey: [QUERY_KEY.FETCH_EPILOG_PROLOG, eventToken, lang, isEpilog],
    queryFn: () => fetchEpilogProlog(eventToken, lang, isEpilog),
    enabled,
    gcTime: 0,
  });
};
