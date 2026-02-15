import {
  generateAllowedCharsPattern,
  getFieldLanguages,
} from '@/utils/languageValidation';
import { useState } from 'react';
import { useTranslation } from './useTranslation';

export function useAlbumName(initialValue: string = '') {
  const { t } = useTranslation();
  const [albumName, setAlbumName] = useState(initialValue);

  const fieldLanguages = getFieldLanguages();
  const allowedCharsPattern = generateAllowedCharsPattern(fieldLanguages);

  const getInputError = () => {
    if (albumName.trim().length > 0 && albumName.trim().length < 2) {
      return t('create_album.errors.too_short');
    }

    if (albumName && !allowedCharsPattern.test(albumName)) {
      return t('create_album.errors.unsupported_characters');
    }

    return undefined;
  };

  const isValid =
    albumName.trim().length >= 2 && allowedCharsPattern.test(albumName);

  return {
    albumName,
    setAlbumName,
    getInputError,
    isValid,
  };
}
