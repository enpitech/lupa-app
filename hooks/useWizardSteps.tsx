import { useTranslation } from '@/hooks/useTranslation';
import useAlbumStore from '@/stores/album';
import type { CustomSettings } from '@/stores/album/types';
import { themesModeEnum } from '@/utils/appConst';
import { useEffect, useMemo } from 'react';

export type WizardStepId = 
  | 'formats' 
  | 'densities' 
  | 'directions' 
  | 'bookCoverType' 
  | 'themes';

export interface WizardStepConfig {
  id: WizardStepId;
  label: string;
  canGoBack: boolean;
  mode?: string; // For themes step
}

export function useWizardSteps() {
  const { t } = useTranslation();
  const album = useAlbumStore((s) => s.album);

  // Sync album settings to store on mount/update
  useEffect(() => {
    if (album?.custom_settings) {
      const { format_id, density, direction, album_theme } =
        album.custom_settings;
      if (format_id) useAlbumStore.getState().setAlbumFormat(format_id);
      if (density) useAlbumStore.getState().setAlbumDensity(density);
      if (direction) useAlbumStore.getState().setAlbumDirection(direction);
      if (album_theme) useAlbumStore.getState().setAlbumTheme(album_theme);
    }
  }, [album?.custom_settings]);

  return useMemo<WizardStepConfig[]>(() => {
    const steps: WizardStepConfig[] = [];
    const customSettings = (album?.custom_settings || {}) as CustomSettings;

    // Only include steps for uncompleted settings
    if (!customSettings.format_id) {
      steps.push({
        id: 'formats',
        label: t('steps.label.formats'),
        canGoBack: false,
      });
    }

    if (!customSettings.density) {
      steps.push({
        id: 'densities',
        label: t('steps.label.densities'),
        canGoBack: true,
      });
    }

    if (!customSettings.direction) {
      steps.push({
        id: 'directions',
        label: t('steps.label.directions'),
        canGoBack: true,
      });
    }

    if (!customSettings.skip_book_style_step) {
      steps.push({
        id: 'bookCoverType',
        label: t('steps.label.bookCoverType'),
        canGoBack: true,
      });
    }

    if (!customSettings.album_theme) {
      steps.push({
        id: 'themes',
        label: t('steps.label.themes'),
        canGoBack: true,
        mode: themesModeEnum.WIZARD,
      });
    }

    return steps;
  }, [album?.custom_settings, t]);
}
