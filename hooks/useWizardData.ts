import { useTranslation } from '@/hooks/useTranslation';
import useAlbumStore from '@/stores/album';
import useWizardDataStore from '@/stores/wizardData';
import { useEffect } from 'react';

export const useWizardData = () => {
  const { i18n } = useTranslation();
  const album = useAlbumStore((state) => state.album);

  const data = useWizardDataStore((state) => state.data);
  const isLoading = useWizardDataStore((state) => state.isLoading);
  const error = useWizardDataStore((state) => state.error);
  const fetchFormats = useWizardDataStore((state) => state.fetchFormats);

  const currentEventToken = album?.event_token || '';
  const currentLang = i18n.language;

  useEffect(() => {
    if (currentEventToken && currentLang && !isLoading) {
      const storeState = useWizardDataStore.getState();

      if (
        !storeState.data ||
        storeState.eventToken !== currentEventToken ||
        storeState.lang !== currentLang
      ) {
        storeState.setEventToken(currentEventToken);
        storeState.setLang(currentLang);

        fetchFormats();
      }
    }
  }, [currentEventToken, currentLang, isLoading, fetchFormats]);

  return {
    data,
    isLoading,
    error,
  };
};
