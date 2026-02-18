import { useLocale } from '@/contexts/locale-context';

/**
 * Translation hook for React Native with Expo
 * Provides translation function, language info, and direction
 * 
 * @example
 * const { t, i18n, direction } = useTranslation();
 * <Text>{t('common.hello', { name: 'John' })}</Text>
 */
export function useTranslation() {
  const { t, locale, changeLocale, direction } = useLocale();

  return {
    t,
    i18n: {
      language: locale,
      changeLanguage: changeLocale,
    },
    direction,
  };
}
