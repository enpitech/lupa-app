import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { en } from './translations/en';
import { he } from './translations/he';

export const AVAILABLE_LANGUAGES = ['he', 'en'] as const;
export type AvailableLanguage = (typeof AVAILABLE_LANGUAGES)[number];

// RTL languages
const RTL_LANGUAGES = ['he', 'ar', 'fa'] as const;

// Language display names
export const LANGUAGE_NAMES: Record<AvailableLanguage, string> = {
  en: 'English',
  he: 'עברית',
};

// Configure i18n
export const i18n = new I18n({
  en: en.translation,
  he: he.translation,
});

// Set default locale to device locale if supported, otherwise fallback to 'he'
const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'he';
const defaultLocale = AVAILABLE_LANGUAGES.includes(deviceLocale as AvailableLanguage)
  ? (deviceLocale as AvailableLanguage)
  : 'he';

i18n.defaultLocale = defaultLocale;
i18n.locale = defaultLocale;
i18n.enableFallback = true;

// Helper to check if language is RTL
export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language as any);
}

// Get device locale
export function getDeviceLocale(): AvailableLanguage {
  const locale = Localization.getLocales()[0]?.languageCode ?? 'he';
  return AVAILABLE_LANGUAGES.includes(locale as AvailableLanguage)
    ? (locale as AvailableLanguage)
    : 'he';
}
