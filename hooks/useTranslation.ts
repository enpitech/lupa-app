import { useI18n } from '@/contexts/i18n-context';

/**
 * Custom useTranslation hook for React Native
 * Provides translation function and language info
 */
export function useTranslation() {
  const { t, language, changeLanguage } = useI18n();

  return {
    t,
    i18n: {
      language,
      changeLanguage,
    },
  };
}
