---
title: Using Theme Fonts - Quick Guide
status: active
date: 2025-12-03
type: guide
---

# Using Theme Fonts - Quick Guide

## ✅ NEW: Use Theme Hooks (Recommended)

Instead of hardcoding fonts in every file, use the theme system:

### Import the Hook

```typescript
import { useFonts } from '@/ui';
// or
import { useTypography } from '@/ui';
```

### Use in Component

```typescript
export default function MyComponent() {
  const fonts = useFonts();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: fonts.display }]}>
        Title
      </Text>
      <Text style={[styles.body, { fontFamily: fonts.primary }]}>
        Body text
      </Text>
      <Text style={[styles.code, { fontFamily: fonts.mono }]}>
        1. e4 e5
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    // fontFamily comes from theme
  },
  body: {
    fontSize: 16,
    // fontFamily comes from theme
  },
  code: {
    fontSize: 12,
    // fontFamily comes from theme
  },
});
```

## Available Font Tokens

```typescript
const fonts = useFonts();

fonts.display        // 'Outfit_700Bold' - for titles/branding
fonts.displayHeavy   // 'Outfit_800ExtraBold' - for hero text
fonts.primary        // 'Inter_400Regular' - for body text
fonts.medium         // 'Inter_500Medium' - for labels
fonts.semibold       // 'Inter_600SemiBold' - for buttons
fonts.bold           // 'Inter_700Bold' - for emphasis
fonts.mono           // 'JetBrainsMono_400Regular' - for code/notation
```

## Usage Patterns

### Pattern 1: Inline Styles (Quick)

```typescript
const fonts = useFonts();

<Text style={{ fontFamily: fonts.display, fontSize: 24 }}>
  Title
</Text>
```

### Pattern 2: StyleSheet with Dynamic Font (Recommended)

```typescript
const fonts = useFonts();

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});

<Text style={[styles.title, { fontFamily: fonts.display }]}>
  Title
</Text>
```

### Pattern 3: Full Typography Object

```typescript
const typography = useTypography();

// Access all typography tokens:
typography.fontFamily.display  // font families
typography.fontSize.xl         // font sizes
typography.fontWeight.bold     // font weights
typography.lineHeight.normal   // line heights
```

## Migration Example

### ❌ Before (Hardcoded)

```typescript
const styles = StyleSheet.create({
  logo: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',  // ❌ Hardcoded
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',  // ❌ Hardcoded
  },
});
```

### ✅ After (Theme-Based)

```typescript
export default function NavigationSidebar() {
  const fonts = useFonts();
  
  const styles = StyleSheet.create({
    logo: {
      fontSize: 20,
      fontWeight: '700',
      // fontFamily from theme below
    },
    navLabel: {
      fontSize: 14,
      fontWeight: '500',
      // fontFamily from theme below
    },
  });
  
  return (
    <View>
      <Text style={[styles.logo, { fontFamily: fonts.display }]}>
        Chessmate
      </Text>
      <Text style={[styles.navLabel, { fontFamily: fonts.medium }]}>
        Dashboard
      </Text>
    </View>
  );
}
```

## Why Use Theme Hooks?

### Benefits

1. **Single Source of Truth**: Change fonts globally by updating typography tokens
2. **Type Safety**: TypeScript autocomplete for font names
3. **Consistency**: No typos or mismatched font names
4. **Maintainability**: Update once, apply everywhere
5. **Testability**: Mock theme in tests
6. **Dynamic Theming**: Could support font preferences in future

### Font Mapping Reference

| Token | Font Family | Use Case |
|-------|-------------|----------|
| `display` | Outfit 700 Bold | Titles, headings, branding |
| `displayHeavy` | Outfit 800 Extra Bold | Hero text, large titles |
| `primary` | Inter 400 Regular | Body text, paragraphs |
| `medium` | Inter 500 Medium | Labels, captions |
| `semibold` | Inter 600 SemiBold | Buttons, emphasized text |
| `bold` | Inter 700 Bold | Strong emphasis, highlights |
| `mono` | JetBrains Mono 400 | Chess notation, code, FEN |

## Complete Example

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useFonts, useColors } from '@/ui';

export default function GameScreen() {
  const fonts = useFonts();
  const colors = useColors();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background.primary,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 20,
    },
    moveText: {
      fontSize: 14,
      letterSpacing: 0.5,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { 
        fontFamily: fonts.display,
        color: colors.foreground.primary 
      }]}>
        Live Game
      </Text>
      
      <Text style={[styles.subtitle, { 
        fontFamily: fonts.primary,
        color: colors.foreground.secondary 
      }]}>
        Round 3 of 8
      </Text>
      
      <Text style={[styles.moveText, { 
        fontFamily: fonts.mono,
        color: colors.foreground.primary 
      }]}>
        1. e4 e5 2. Nf3 Nc6
      </Text>
    </View>
  );
}
```

## Next Steps

To migrate existing hardcoded fonts:

1. Add `const fonts = useFonts();` at component top
2. Remove hardcoded `fontFamily` from StyleSheet
3. Apply font via style array: `style={[styles.text, { fontFamily: fonts.primary }]}`
4. Test component renders correctly

## See Also

- `app/ui/hooks/useThemeTokens.ts` - Theme hooks
- `app/ui/tokens/typography.ts` - Font definitions
- `app/docs/design-language-system.md` - Full DLS documentation
