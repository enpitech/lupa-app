import { queryKeys } from '@/constants/query-keys';
import { fetchUser } from '@/services/api/fetch-user';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';

export const useUserProfile = () => {
  const user = useUserStore((state) => state.user);

  return useQuery({
    queryKey: queryKeys.user.profile(user?.token),
    queryFn: () => fetchUser({ token: user!.token }),
    enabled: !!user?.token,
  });
};
