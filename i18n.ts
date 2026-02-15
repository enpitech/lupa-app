export const AVAILABLE_LANGUAGES = ['he', 'en'] as const;
export type AvailableLanguage = (typeof AVAILABLE_LANGUAGES)[number];
