import { StateCreator } from 'zustand';
import { UserStore, User } from '@/types/user';
import { trackError } from '@/utils/datadogErrorTracking';

export const getUpdateProfileAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['updateProfile']
> = (set, get) => async (updates: Partial<User>) => {
  set({ isLoading: true, error: null });
  try {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const updatedUser = await callUpdateProfileApi(updates);

    set({
      user: { ...currentUser, ...updatedUser, isAuthenticated: true },
      isLoading: false,
    });
  } catch (error) {
    const errorObj = error as Error;

    trackError(errorObj, {
      errorType: 'store_error',
      store: 'user',
      action: 'updateProfile',
      userEmail: get().user?.email,
      updates: Object.keys(updates),
    });

    set({ error: errorObj.message, isLoading: false });
  }
};

async function callUpdateProfileApi(updates: Partial<User>): Promise<User> {
  const response = await mockUpdateProfileApi(updates);

  if (!response.ok) {
    throw new Error('Profile update failed');
  }

  return response.json();
}

const mockUpdateProfileApi = async (
  updates: Partial<User>
): Promise<Response> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve(updates),
      } as Response);
    }, 1000);
  });
};
