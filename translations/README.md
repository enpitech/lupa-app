# Internationalization (i18n)

## Overview

This app uses `expo-localization` and `i18n-js` for internationalization, providing:
- Automatic device locale detection
- Language preference persistence (via secure storage)
- RTL/LTR direction management
- Type-safe translations
- Simple, familiar API (similar to react-i18next)

## Supported Languages

- English (`en`)
- Hebrew (`he`) - RTL

## Key Components

### Configuration
- **`i18n.ts`**: Core i18n setup using `i18n-js` and `expo-localization`
- **`contexts/locale-context.tsx`**: Unified provider for locale, direction, and translations
- **`hooks/useTranslation.ts`**: Main translation hook with react-i18next-like API
- **`hooks/useDirection.ts`**: Direction hook for RTL support

### Translation Files
- **`translations/en.ts`**: English translations
- **`translations/he.ts`**: Hebrew translations
- **`translations/index.ts`**: Export configuration

## Usage

### Basic Translation

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('common.hello')}</Text>
      <Text>{t('common.loading')}</Text>
    </View>
  );
}
```

### Translation with Parameters

```tsx
function WelcomeScreen() {
  const { t } = useTranslation();
  const userName = 'John';

  return (
    <Text>{t('welcome.greeting', { name: userName })}</Text>
  );
}
```

Translation files should use `{{variable}}` syntax:
```ts
// en.ts
'welcome.greeting': 'Hello, {{name}}!'

// he.ts
'welcome.greeting': 'שלום, {{name}}!'
```

### Changing Language

```tsx
function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const switchToEnglish = () => {
    i18n.changeLanguage('en');
  };

  const switchToHebrew = () => {
    i18n.changeLanguage('he');
  };

  return (
    <View>
      <Button title="English" onPress={switchToEnglish} />
      <Button title="עברית" onPress={switchToHebrew} />
    </View>
  );
}
```

### RTL Support

The direction automatically adjusts based on the selected language.

```tsx
import { useTranslation } from '@/hooks/useTranslation';
// OR
import { useDirection } from '@/hooks/useDirection';

function RTLAwareComponent() {
  const { direction } = useTranslation();

  return (
    <View 
      style={{ 
        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row' 
      }}
    >
      <Text>This respects RTL</Text>
    </View>
  );
}
```

### Getting Current Language

```tsx
function LanguageDisplay() {
  const { i18n } = useTranslation();

  return (
    <Text>Current language: {i18n.language}</Text>
  );
}
```

## Adding New Translations

1. **Add the key to both language files:**

```ts
// translations/en.ts
export const en = {
  translation: {
    'myFeature.title': 'My Feature',
    'myFeature.description': 'This is my feature with {{count}} items',
  },
};

// translations/he.ts
export const he = {
  translation: {
    'myFeature.title': 'התכונה שלי',
    'myFeature.description': 'זוהי התכונה שלי עם {{count}} פריטים',
  },
};
```

2. **Use in your component:**

```tsx
function MyFeature() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('myFeature.title')}</Text>
      <Text>{t('myFeature.description', { count: 5 })}</Text>
    </View>
  );
}
```

## Translation Key Naming Convention

Use dot-notation with descriptive namespacing:

```
[screen].[component].[element]
```

Examples:
- `photoStack.deleteConfirm.minImagesHeader`
- `common.loading`
- `errors.updateTree_title`
- `editor.sharedLupaMessage`

## Best Practices

1. **Never hardcode user-facing strings** - Always use translations
2. **Use descriptive keys** - Keys should be self-documenting
3. **Keep translations in sync** - When adding a key to `en.ts`, add it to `he.ts`
4. **Test RTL layouts** - Always test Hebrew mode when changing UI
5. **Use parameters for dynamic content** - `t('greeting', { name })` instead of string concatenation
6. **Group related translations** - Use common prefixes for related strings

## Troubleshooting

### Translation not found
If you see a warning like "Translation missing for key: x.y.z", check:
1. Is the key present in both `en.ts` and `he.ts`?
2. Is the key spelled correctly?
3. Did you restart the app after adding the translation?

### RTL not working
1. Check that the language is correctly set in `i18n.ts` RTL_LANGUAGES array
2. Verify you're using `direction` from `useTranslation()` in your styles
3. Check React Native's I18nManager settings

### Language not persisting
The language preference is stored in secure storage and should persist across app restarts. If it doesn't:
1. Check secure storage permissions
2. Verify the app has access to `expo-secure-store`
3. Check for errors in the console related to storage

## Architecture

The i18n system uses a single unified context (`LocaleProvider`) that manages:
- Current locale state
- Translation function
- Text direction (RTL/LTR)
- I18nManager configuration
- Persistence of language preference

This replaces the previous separate `I18nProvider` and `DirectionProvider`.
