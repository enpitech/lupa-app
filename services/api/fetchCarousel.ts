import { CarouselResponse } from '@/types/carousel';
import { apiMethods, getApiUrl } from './config';
import i18n from '@/i18n';

export const fetchCarousel = async (): Promise<CarouselResponse> => {
  const url = getApiUrl({
    method: apiMethods.carousel,
    params: {
      support_haggadah: 'true',
      support_mini_lupa: 'true',
      support_tile_card: 'true',
      support_mosaic_card: 'true',
      lang: i18n.language,
    },
  });
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch carousel data: ${response.statusText}`);
    }

    const data: CarouselResponse = await response.json();

    if (!data.isValid) {
      throw new Error(data.error || 'Invalid response from carousel API');
    }

    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch carousel data');
  }
};
