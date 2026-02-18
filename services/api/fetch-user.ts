import { getApiUrl } from './config';

export const fetchUser = async ({ token }: { token: string }) => {
  const response = await fetch(
    getApiUrl({ method: 'getPersonalInfo', params: { token } })
  );

  if (!response.ok) {
    throw new Error(`fetchUser failed with status: ${response.status}`);
  }

  return response.json();
};
