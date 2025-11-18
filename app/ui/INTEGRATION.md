---
title: Design System Integration Guide
service: app
status: active
last_reviewed: 2025-11-15
type: how-to
---

# Design System Integration Guide

This guide walks you through integrating the complete ChessMate design system into your Expo application.

## Quick Start (5 minutes)

### 1. Wrap Your App with ThemeProvider

In your root app component (`app/App.tsx` or `app/app.tsx`):

```tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/ui';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider defaultMode="auto">
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

The `defaultMode` accepts:
- `'light'` - Always use light theme
- `'dark'` - Always use dark theme
- `'auto'` - Follow system color scheme preference

### 2. Use Components in Your Screens

Import directly from `@/ui`:

```tsx
import { Box, Text, Button, useColors } from '@/ui';
import { useIsDark } from '@/ui';

export function MyScreen() {
  const colors = useColors();
  const isDark = useIsDark();

  return (
    <Box
      padding={4}
      backgroundColor={colors.background}
      flex={1}
    >
      <Text variant="heading" color={colors.foreground}>
        Welcome
      </Text>
      <Button 
        onPress={() => console.log('Pressed')}
        color="blue"
      >
        Get Started
      </Button>
    </Box>
  );
}
```

### 3. Test Theme Switching

Add a theme toggle button to verify light/dark mode works:

```tsx
import { useThemeTokens } from '@/ui';

export function SettingsScreen() {
  const { mode, setMode } = useThemeTokens();

  return (
    <Box padding={4}>
      <Button 
        onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}
      >
        Current: {mode} | Toggle Theme
      </Button>
    </Box>
  );
}
```

## Complete Component Reference

### Tokens
- `colorTokens` - 6 color palettes (neutral, blue, purple, green, red, amber, cyan)
- `typographyTokens` - Font family, sizes, weights, line height, letter spacing
- `spacingTokens` - Spacing scale (0-96px)
- `radiusTokens` - Border radius values
- `shadowTokens` - Elevation and shadow styles
- `motionTokens` - Duration and easing functions

### Primitives
- `Box` - Flexbox container (replacement for View)
- `Text` - Typography component with variants
- `Button` - Interactive button (solid/outline/subtle/ghost)
- `Card` - Elevated card container
- `Panel` - Translucent overlay component
- `Input` - TextInput wrapper
- `Tag` - Badge/chip component
- `Avatar` - User avatar with initials
- `Divider` - Horizontal separator line
- `Surface` - Gradient backdrop

### Chess Components
- `MatchCard` - Match score display
- `ScoreInput` - Score adjuster (+/−)
- `PlayerRow` - Player info with stats
- `TournamentHeader` - Tournament title section
- `RoundSelector` - Horizontal round picker
- `ActionBar` - Bottom action buttons

### Theme Hooks
- `useThemeTokens()` - Full theme context (mode, isDark, setMode, colors)
- `useColors()` - Get semantic colors for current theme
- `useIsDark()` - Get boolean isDark state

## Common Patterns

### Creating a Screen with Consistent Styling

```tsx
import { Box, Text, Button, Card, useColors } from '@/ui';

export function MatchesScreen() {
  const colors = useColors();

  return (
    <Box
      flex={1}
      backgroundColor={colors.background}
      padding={4}
    >
      <Text variant="heading" marginBottom={4}>
        My Matches
      </Text>

      <Card padding={4} marginBottom={3}>
        <Text variant="body" color={colors.foreground}>
          Match details go here
        </Text>
      </Card>

      <Button color="blue" onPress={() => {}}>
        Start New Match
      </Button>
    </Box>
  );
}
```

### Using Semantic Colors

```tsx
const colors = useColors();

// Layout colors
colors.background     // Page background
colors.foreground     // Text color
colors.card          // Card backgrounds
colors.muted         // Muted/disabled text

// Semantic colors
colors.success       // Success states (green)
colors.error         // Error states (red)
colors.warning       // Warning states (amber)
colors.info          // Info states (cyan)

// Interactive colors
colors.primary       // Primary actions (blue)
colors.secondary     // Secondary actions (purple)
```

### Composing Complex Layouts with Box

```tsx
// Flex row with space-between
<Box flexDirection="row" justifyContent="space-between" padding={4}>
  <Text>Left</Text>
  <Text>Right</Text>
</Box>

// Centered container
<Box flex={1} justifyContent="center" alignItems="center">
  <Text>Centered</Text>
</Box>

// Gap between items
<Box gap={2}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</Box>
```

### Text Variants

```tsx
// Heading - size 3xl, weight 700
<Text variant="heading">Main Title</Text>

// Subheading - size 2xl, weight 600
<Text variant="subheading">Subtitle</Text>

// Title - size xl, weight 600
<Text variant="title">Section Title</Text>

// Body - size base, weight 400 (default)
<Text variant="body">Regular text</Text>

// Caption - size sm, weight 500
<Text variant="caption">Small text</Text>

// Label - size xs, weight 600
<Text variant="label">Input Label</Text>

// Hint - size xs, weight 400, muted color
<Text variant="hint">Helper text</Text>
```

### Button Variants

```tsx
// Solid (default, filled background)
<Button variant="solid" color="blue">Primary</Button>

// Outline (bordered, transparent background)
<Button variant="outline" color="blue">Secondary</Button>

// Subtle (minimal background, colored text)
<Button variant="subtle" color="blue">Tertiary</Button>

// Ghost (transparent, colored text, no border)
<Button variant="ghost" color="blue">Minimal</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button isLoading>Loading...</Button>
```

### Chess Component Example

```tsx
import { 
  Box, 
  TournamentHeader, 
  MatchCard, 
  ActionBar,
  useColors 
} from '@/ui';

export function TournamentScreen() {
  const colors = useColors();

  return (
    <Box
      flex={1}
      backgroundColor={colors.background}
    >
      <TournamentHeader
        title="2025 Winter Championship"
        subtitle="Round 5 of 8"
        badge="LIVE"
      />

      <Box padding={4} gap={3}>
        <MatchCard
          player1={{ name: 'Alice', rating: 1850 }}
          player2={{ name: 'Bob', rating: 1920 }}
          score1={1}
          score2={0}
          status="active"
          onPress={() => {}}
        />
      </Box>

      <ActionBar
        actions={[
          { label: 'Scores', onPress: () => {} },
          { label: 'Results', onPress: () => {} },
          { label: 'Standings', onPress: () => {} },
        ]}
      />
    </Box>
  );
}
```

## Spacing Scale Reference

Use numeric values (0-96) for `padding`, `margin`, `gap`:

| Value | px    | Use Case |
|-------|-------|----------|
| 0     | 0px   | Remove spacing |
| 1     | 2px   | Micro gaps |
| 2     | 4px   | Tight spacing |
| 3     | 6px   | Compact spacing |
| 4     | 8px   | Default padding/gap |
| 6     | 12px  | Medium spacing |
| 8     | 16px  | Gutter, card padding |
| 12    | 24px  | Section spacing |
| 16    | 32px  | Large spacing |

## Troubleshooting

### "Cannot find module '@/ui'"

Ensure your `tsconfig.json` has the `@` path alias:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Colors not updating on theme change

Make sure you're using `useColors()` hook inside a component wrapped by `ThemeProvider`:

```tsx
// ❌ Wrong - useColors() called outside provider
const colors = useColors();

export function MyApp() {
  return <ThemeProvider>{/* ... */}</ThemeProvider>;
}

// ✅ Right - useColors() called inside provider
export function MyApp() {
  return (
    <ThemeProvider>
      <MyScreen />
    </ThemeProvider>
  );
}

function MyScreen() {
  const colors = useColors(); // Correct
  return <Box backgroundColor={colors.background} />;
}
```

### TypeScript errors on custom styles

Use `React.CSSProperties` for additional style overrides:

```tsx
import { ViewStyle } from 'react-native';

<Box
  style={{
    // Your custom styles
    opacity: 0.8,
  } as ViewStyle}
/>
```

## Next Steps

1. **Wrap your app** with `ThemeProvider`
2. **Replace View/Text** with `Box`/`Text` in screens
3. **Use semantic colors** from `useColors()`
4. **Build screens** using chess components
5. **Test theme switching** with light/dark modes
6. **Create reusable screen layouts** following the patterns above

## Documentation References

- **DLS.md** - Complete token definitions and component code
- **TypeScript** - All components are fully typed for autocompletion
- **React Native** - Uses standard RN components (View, Text, Pressable)
- **Theming** - Auto light/dark mode detection + manual override support

## Support

For issues or questions:
1. Check DLS.md for component examples
2. Review INTEGRATION.md patterns
3. Verify ThemeProvider wrapping
4. Ensure tsconfig.json path alias is set
