import { AcceptScreenLanguage } from '@/services/api/fetchAcceptScreen';
import { useAcceptScreenStore } from '@/stores/acceptScreen';

export const getFieldLanguages = (): AcceptScreenLanguage[] | undefined => {
  const acceptScreenData = useAcceptScreenStore.getState().data;
  return acceptScreenData?.payload.field_languages;
};

export const generateAllowedCharsPattern = (
  fieldLanguages?: AcceptScreenLanguage[]
): RegExp => {
  if (!fieldLanguages || fieldLanguages.length === 0) {
    return /^[\u0020-\u00FF\u0400-\u052F\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]*$/;
  }

  let regexPattern = '^[';
  regexPattern += '\\u0020';

  fieldLanguages.forEach((language) => {
    language.ranges.forEach((range) => {
      const [first, second] = range.offet;
      const start = Math.min(first, second);
      const end = Math.max(first, second);

      if (start === end) {
        regexPattern += `\\u${start.toString(16).padStart(4, '0').toUpperCase()}`;
      } else {
        regexPattern += `\\u${start.toString(16).padStart(4, '0').toUpperCase()}-\\u${end.toString(16).padStart(4, '0').toUpperCase()}`;
      }
    });

    language.specials.forEach((special) => {
      regexPattern += `\\u${special.toString(16).padStart(4, '0').toUpperCase()}`;
    });
  });

  regexPattern += ']*$';

  try {
    return new RegExp(regexPattern);
  } catch (error) {
    console.error('Failed to create regex pattern:', regexPattern, error);
    return /^[\u0020-\u00FF\u0400-\u052F\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]*$/;
  }
};

export const generateLanguageNames = (
  fieldLanguages?: AcceptScreenLanguage[]
): string => {
  if (!fieldLanguages || fieldLanguages.length === 0) {
    return 'Arabic, Cyrillic, Latin, or Hebrew characters';
  }

  const names = fieldLanguages.map((lang) => lang.name);
  if (names.length === 1) {
    return `${names[0]} characters`;
  }
  if (names.length === 2) {
    return `${names[0]} or ${names[1]} characters`;
  }
  return `${names.slice(0, -1).join(', ')}, or ${names[names.length - 1]} characters`;
};
