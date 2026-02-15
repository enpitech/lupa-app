import { useQuery } from '@tanstack/react-query';
import { fetchAcceptScreen } from '@/services/api/fetchAcceptScreen';
import { useAcceptScreenStore } from '@/stores/acceptScreen';
import { QUERY_KEY } from '@/utils/appConst';

export const useAcceptScreen = () => {
  const setData = useAcceptScreenStore((state) => state.setData);
  const setLoading = useAcceptScreenStore((state) => state.setLoading);
  const setError = useAcceptScreenStore((state) => state.setError);
  const data = useAcceptScreenStore((state) => state.data);
  const isInitialized = useAcceptScreenStore((state) => state.isInitialized);

  const query = useQuery({
    queryKey: [QUERY_KEY.ACCEPT_SCREEN],
    queryFn: async () => {
      setLoading(true);
      try {
        const result = await fetchAcceptScreen();
        setData(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to fetch accept screen data';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !isInitialized,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });

  return {
    ...query,
    data: data || query.data,
    acceptScreenData: data,
  };
};
