import { useLocale } from '@/contexts/locale-context';

/**
 * Hook to get the current text direction (RTL/LTR)
 * 
 * @example
 * const { direction } = useDirection();
 * <View style={{ flexDirection: direction === 'rtl' ? 'row-reverse' : 'row' }}>
 */
export function useDirection() {
  const { direction } = useLocale();
  return { direction };
}
