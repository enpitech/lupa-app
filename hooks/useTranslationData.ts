import { useTranslation } from './useTranslation';

export function useTranslationData() {
  const { i18n } = useTranslation();
  const language = i18n.language;
  return { language };
}
