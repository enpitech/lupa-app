import type { AvailableLanguage } from '@/i18n';
import { getDeviceLocale, i18n, isRTL } from '@/i18n';
import { secureStorage } from '@/utils/secure-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { I18nManager } from 'react-native';

export type Direction = 'ltr' | 'rtl';

const LANGUAGE_STORAGE_KEY = 'user_language_preference';

interface LocaleContextValue {
  locale: AvailableLanguage;
  direction: Direction;
  changeLocale: (locale: AvailableLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = useState<AvailableLanguage>(() => {
    // Initialize with device locale or stored preference
    return i18n.locale as AvailableLanguage;
  });
  const [direction, setDirection] = useState<Direction>(() => isRTL(locale) ? 'rtl' : 'ltr');
  const [isReady, setIsReady] = useState(false);

  // Load stored language preference on mount
  useEffect(() => {
    async function loadLanguagePreference() {
      try {
        const stored = await secureStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored) {
          const lang = stored as AvailableLanguage;
          i18n.locale = lang;
          setLocale(lang);
          setDirection(isRTL(lang) ? 'rtl' : 'ltr');
        } else {
          // No stored preference, use device locale
          const deviceLocale = getDeviceLocale();
          i18n.locale = deviceLocale;
          setLocale(deviceLocale);
          setDirection(isRTL(deviceLocale) ? 'rtl' : 'ltr');
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
        // Fall back to device locale
        const deviceLocale = getDeviceLocale();
        i18n.locale = deviceLocale;
        setLocale(deviceLocale);
        setDirection(isRTL(deviceLocale) ? 'rtl' : 'ltr');
      } finally {
        setIsReady(true);
      }
    }

    loadLanguagePreference();
  }, []);

  const changeLocale = async (newLocale: AvailableLanguage) => {
    try {
      // Update i18n
      i18n.locale = newLocale;
      
      // Update direction
      const newDirection = isRTL(newLocale) ? 'rtl' : 'ltr';
      setDirection(newDirection);
      
      // Update React Native's I18nManager if direction changes
      if (I18nManager.isRTL !== (newDirection === 'rtl')) {
        I18nManager.allowRTL(newDirection === 'rtl');
        I18nManager.forceRTL(newDirection === 'rtl');
      }
      
      // Update state
      setLocale(newLocale);
      
      // Persist preference
      await secureStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
    } catch (error) {
      console.error('Error changing locale:', error);
      throw error;
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return i18n.t(key, params);
  };

  // Don't render children until language preference is loaded
  if (!isReady) {
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, direction, changeLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
