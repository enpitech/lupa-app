import { useQuery } from '@tanstack/react-query';
import { fetchCarousel } from '@/services/api/fetchCarousel';
import { CarouselResponse } from '@/types/carousel';
import { useTranslationData } from '@/hooks/useTranslationData';

export const useCarousel = () => {
  const { language } = useTranslationData();

  return useQuery<CarouselResponse, Error>({
    queryKey: ['carousel', language],
    queryFn: fetchCarousel,
  });
};

export default useCarousel;
