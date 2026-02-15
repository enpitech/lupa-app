import { createEpilogProlog } from '@/services/api/createEpilogProlog';
import { FormTextData } from '@/types/editor';
import useAlbumTreeStore from '@/stores/albumTree';
import { useMutation } from '@tanstack/react-query';
import { useSaveLock } from './useSaveLock';

export const useCreateEpilogPrologMutation = () => {
  const { waitForSaveLock } = useSaveLock();

  interface createEpilogPrologMutationFnProps {
    eventToken: string;
    lang: string;
    isEpilog: boolean;
    data?: FormTextData;
  }

  const mutationFn = async ({
    eventToken,
    lang,
    isEpilog,
    data,
  }: createEpilogPrologMutationFnProps) => {
    // Wait for auto-save lock to be released
    await waitForSaveLock();
    
    const response = await createEpilogProlog(
      eventToken,
      lang,
      isEpilog,
      data,
      useAlbumTreeStore.getState().m_creationTime
    );

    return response;
  };

  return useMutation({
    mutationFn: mutationFn,
    onMutate: () => {
      useAlbumTreeStore.getState().setIsInSaveProcess(true);
    },
    onSettled: () => {
      useAlbumTreeStore.getState().setIsInSaveProcess(false);
    },
    onError: (error) => {
      console.error('Error creating epilog/prolog:', error);
    },
  });
};
