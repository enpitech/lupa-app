import { getApiUrl } from './config';

export const fetchCleverTapEvent = async (event: {
  eventName: string;
  eventData: Record<string, unknown> | null | undefined;
}) => {
  const formData = new FormData();
  formData.append(
    'rise_data',
    JSON.stringify({
      eventName: event.eventName,
      extraParams: {
        source: 'desktop',
        ...(event.eventData ?? {}),
      },
    })
  );

  try {
    const response = await fetch(getApiUrl({ method: 'risedata' }), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update tree:', error);
    throw error;
  }
};
