import type { AvailableLanguage } from '@/i18n';
import { resources } from '@/translations';
import { createContext, useContext, useState, type ReactNode } from 'react';

type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

interface I18nContextValue {
  language: AvailableLanguage;
  changeLanguage: (lang: AvailableLanguage) => void;
  t: TranslationFunction;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: AvailableLanguage;
}

export function I18nProvider({ children, initialLanguage = 'he' }: I18nProviderProps) {
  const [language, setLanguage] = useState<AvailableLanguage>(initialLanguage);

  const t: TranslationFunction = (key: string, params?: Record<string, string | number>) => {
    const translation = resources[language]?.translation[key as keyof typeof resources[typeof language]['translation']];
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Only handle string translations (skip objects like uppyStatusBar)
    if (typeof translation !== 'string') {
      console.warn(`Translation for key "${key}" is not a string`);
      return key;
    }

    // Simple interpolation for {{variable}} patterns
    if (params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (_match: string, paramKey: string) => {
        return params[paramKey]?.toString() ?? _match;
      });
    }

    return translation;
  };

  const changeLanguage = (lang: AvailableLanguage) => {
    setLanguage(lang);
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
