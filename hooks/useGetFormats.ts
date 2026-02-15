import { useQuery } from '@tanstack/react-query';
import { fetchFormats } from '@/services/api/fetchFormats';

export const useGetFormats = ({
  eventToken,
  lang,
}: {
  eventToken: string;
  lang: string;
}) => {
  return useQuery({
    queryKey: ['get-formats', eventToken, lang],
    queryFn: () => fetchFormats({ eventToken, lang }),
  });
};
