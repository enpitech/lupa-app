import { getApiUrl } from './config';

export const fetchRefreshToken = async () => {
  const response = await fetch(
    getApiUrl({ method: 'refreshToken' })
  );

  if (!response.ok) {
    throw new Error(`refreshToken failed with status: ${response.status}`);
  }

  return response.json();
};
