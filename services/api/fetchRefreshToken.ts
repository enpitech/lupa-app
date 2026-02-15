import { apiMethods, getApiUrl } from './config';

export const fetchRefreshToken = async () => {
  try {
    const response = await fetch(
      getApiUrl({ method: apiMethods.refreshToken })
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};
