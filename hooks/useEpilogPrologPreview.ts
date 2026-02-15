import { fetchEpilogPrologPreview } from '@/services/api/fetchEpilogPrologPreview';
import { FormTextData } from '@/types/editor';
import { useMutation } from '@tanstack/react-query';
import { trackUserActionError } from '@/utils/datadogErrorTracking';

export const useEpilogPrologPreviewMutation = () => {
  interface epilogPrologPreviewMutationFnProps {
    eventToken: string;
    lang: string;
    isEpilog: boolean;
    data?: FormTextData;
  }

  const epilogPrologPreviewMutationFn = ({
    eventToken,
    lang,
    isEpilog,
    data,
  }: epilogPrologPreviewMutationFnProps) =>
    fetchEpilogPrologPreview(eventToken, lang, isEpilog, data);

  return useMutation({
    mutationFn: epilogPrologPreviewMutationFn,
    onSuccess: (data) => {
      return data;
    },
    onError: (error, variables) => {
      trackUserActionError(error as Error, 'epilogPrologPreview', {
        component: 'useEpilogPrologPreviewMutation',
        eventToken: variables.eventToken,
        isEpilog: variables.isEpilog,
      });
    },
  });
};
