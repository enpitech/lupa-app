import { useTranslation } from '@/hooks/useTranslation';
import { createContext, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';

export type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<{
  direction: Direction;
  setDirection: (dir: Direction) => void;
}>({
  direction: 'ltr',
  setDirection: () => undefined,
});

interface DirectionProviderProps {
  children: React.ReactNode;
}

export function DirectionProvider({ children }: DirectionProviderProps) {
  const [direction, setDirection] = useState<Direction>('ltr');
  const { i18n } = useTranslation();

  useEffect(() => {
    setDirection(i18n.language === 'he' ? 'rtl' : 'ltr');
  }, [i18n.language]);

  return (
    <DirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </DirectionContext.Provider>
  );
}

export const useDirection = () => useContext(DirectionContext);
