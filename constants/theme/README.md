# Theme System

This directory contains the app's design system tokens and theme configuration. The theme provides a consistent, type-safe way to style components across the app.

## Structure

- **`index.ts`** - Main theme export (import from here)
- **`colors.ts`** - Color palette and semantic color names
- **`spacing.ts`** - Spacing scale and screen padding values
- **`typography.ts`** - Typography presets, font sizes, weights, and families
- **`shadows.ts`** - Platform-specific shadow/elevation presets
- **`borders.ts`** - Border radius and width values
- **`timing.ts`** - Animation duration constants

## Usage

Import the theme in your component:

```tsx
import { theme } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
});
```

## Best Practices

1. **Never hardcode design values** - Always use theme tokens
2. **Use semantic colors** - Prefer `theme.colors.text` over `theme.colors.palette.neutral900`
3. **Use typography presets** - Apply `theme.typography.h1` for consistent text styling
4. **Spread typography first** - Override specific properties after spreading the preset
5. **Use screen padding** - Apply `theme.screenPadding.horizontal` for consistent screen margins
6. **Apply shadows with spread** - Use `...theme.shadows.md` for platform-specific shadows

## Quick Reference

### Colors
- Semantic: `text`, `background`, `tint`, `border`, `error`, `success`, `warning`, `info`
- Palette: Access via `theme.colors.palette.primary500`, etc.

### Spacing
- Scale: `xs` (8), `sm` (12), `md` (16), `lg` (20), `xl` (24), `xxl` (32), `xxxl` (40), `huge` (48), `massive` (64)

### Typography
- Presets: `display`, `h1`, `h2`, `h3`, `h4`, `h5`, `body`, `bodyLarge`, `bodySmall`, `caption`, `label`, `button`

### Shadows
- Sizes: `none`, `sm`, `md`, `lg`, `xl`, `xxl` (platform-specific)

### Borders
- Radius: `none`, `xs` (2), `sm` (4), `md` (8), `lg` (12), `xl` (16), `xxl` (24), `full` (999)
- Width: `none`, `thin` (1), `medium` (2), `thick` (3)

### Timing
- Durations: `instant` (100), `quick` (200), `normal` (300), `slow` (500), `slower` (800)

## TypeScript

All theme tokens are fully typed with autocomplete support. TypeScript will validate your usage and prevent typos.

```tsx
// ✅ Type-safe - autocomplete works
const spacing = theme.spacing.md;

// ❌ Type error - 'medium' doesn't exist
const spacing = theme.spacing.medium;
```
