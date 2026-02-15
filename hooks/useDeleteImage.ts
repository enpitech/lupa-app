import { deleteImage } from '@/services/api/deleteImage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackUserActionError } from '@/utils/datadogErrorTracking';
import { Album, ImageData } from '@/stores/album/types';
import { QUERY_KEY } from '@/utils/appConst';

const updateCacheRemoveImages = (
  queryClient: ReturnType<typeof useQueryClient>,
  eventToken: string,
  imageIds: number[]
) => {
  queryClient.setQueryData(
    [QUERY_KEY.ALBUMS_BY_EVENT_TOKEN, eventToken],
    (oldData: { payload: Album } | undefined) => {
      if (!oldData?.payload?.img_arr) return oldData;

      return {
        ...oldData,
        payload: {
          ...oldData.payload,
          img_arr: oldData.payload.img_arr.filter(
            (img: ImageData) => !imageIds.includes(img.uniqueId)
          ),
        },
      };
    }
  );
};

export const useRemoveImagesFromCache = (eventToken: string) => {
  const queryClient = useQueryClient();

  const removeImagesFromCache = (imageIds: number[]) => {
    updateCacheRemoveImages(queryClient, eventToken, imageIds);
  };

  return { removeImagesFromCache };
};

export const useDeleteImage = ({ eventToken }: { eventToken: string }) => {
  const queryClient = useQueryClient();
  const queryKey = [QUERY_KEY.ALBUMS_BY_EVENT_TOKEN, eventToken];
  return useMutation({
    mutationFn: ({ image_name }: { image_name: string; uniqueId: number }) => {
      return deleteImage({ eventToken, image_name });
    },
    onMutate: ({ uniqueId }) => {
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      updateCacheRemoveImages(queryClient, eventToken, [uniqueId]);

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback to the previous state instantly
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      queryClient.invalidateQueries({ queryKey });

      trackUserActionError(error as Error, 'deleteImage', {
        component: 'useDeleteImage',
        eventToken,
        imageName: variables.image_name,
      });
    },
  });
};
