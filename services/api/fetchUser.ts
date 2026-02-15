import { useUserStore } from '@/stores/user';
import { getApiUrl, apiMethods } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';

export const fetchUser = async ({ token }: { token: string }) => {
  try {
    let response = await fetch(
      getApiUrl({ params: { token }, method: apiMethods.getPersonalInfo })
    );
    if (!response.ok) {
      const { user, refresh, setUser } = useUserStore.getState();

      if (response.status === 401 && user?.refreshtoken) {
        await refresh(user);
        const updatedUser = useUserStore.getState().user;

        if (updatedUser && updatedUser.token) {
          response = await fetch(
            getApiUrl({
              params: { token: updatedUser.token },
              method: apiMethods.getPersonalInfo,
            })
          );

          if (!response.ok) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
    return response.json();
  } catch (error) {
    trackApiError(error as Error, apiMethods.getPersonalInfo, {
      statusCode: (error as { status?: number })?.status,
    });
    throw error;
  }
};
