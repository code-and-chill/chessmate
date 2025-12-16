---
title: Tailwind CSS & DLS Integration Guide
service: app
status: active
last_reviewed: 2025-12-12
type: standard
---

# Tailwind CSS & Design Language System Integration Guide

Complete guide for using Tailwind CSS with the Design Language System (DLS) in the Chessmate app.

## Overview

This guide explains how Tailwind CSS utilities map to DLS tokens and provides migration patterns for converting code to use DLS-first approach.

## Architecture

```
┌─────────────────┐
│  Features/Routes│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ DLS Components  │ ← Use DLS props for design values
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DLS Tokens    │ ← Single source of truth
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tailwind Utils  │ ← Maps to DLS tokens
└─────────────────┘
```

## Core Principles

1. **DLS tokens are the source of truth** - All design values come from DLS
2. **Tailwind maps to DLS** - Every Tailwind utility uses DLS values
3. **DLS-first approach** - Prefer DLS props over Tailwind classes for design values
4. **Tailwind for layout** - Use Tailwind classes for layout utilities (flex, grid, positioning)

## Token Mapping Reference

### Spacing

| Tailwind Class | DLS Token | Value |
|----------------|-----------|-------|
| `p-1`, `m-1`, `gap-1` | `spacingTokens[1]` | 4px |
| `p-2`, `m-2`, `gap-2` | `spacingTokens[2]` | 8px |
| `p-3`, `m-3`, `gap-3` | `spacingTokens[3]` | 12px |
| `p-4`, `m-4`, `gap-4` | `spacingTokens[4]` | 16px |
| `p-5`, `m-5`, `gap-5` | `spacingTokens[5]` | 24px |
| `p-6`, `m-6`, `gap-6` | `spacingTokens[6]` | 32px |
| `p-7`, `m-7`, `gap-7` | `spacingTokens[7]` | 40px |
| `p-8`, `m-8`, `gap-8` | `spacingTokens[8]` | 48px |
| `p-9`, `m-9`, `gap-9` | `spacingTokens[9]` | 64px |
| `p-10`, `m-10`, `gap-10` | `spacingTokens[10]` | 80px |
| `p-12`, `m-12`, `gap-12` | `spacingTokens[12]` | 96px |

### Colors

#### Base Color Palettes
| Tailwind Class | DLS Token | Example |
|----------------|-----------|---------|
| `bg-neutral-500` | `colorTokens.neutral[500]` | `#64748B` |
| `text-blue-600` | `colorTokens.blue[600]` | `#0284C7` |
| `border-purple-400` | `colorTokens.purple[400]` | `#A78BFA` |

#### Semantic Colors (Theme-Aware)
| Tailwind Class | DLS Token | Description |
|----------------|-----------|-------------|
| `bg-background-primary` | `colors.background.primary` | Main background |
| `bg-background-secondary` | `colors.background.secondary` | Card background |
| `text-foreground-primary` | `colors.foreground.primary` | Primary text |
| `text-foreground-secondary` | `colors.foreground.secondary` | Secondary text |
| `bg-accent-primary` | `colors.accent.primary` | Primary accent |
| `text-success` | `colors.success` | Success color |
| `text-error` | `colors.error` | Error color |
| `text-warning` | `colors.warning` | Warning color |

### Typography

| Tailwind Class | DLS Token | Value |
|----------------|-----------|-------|
| `text-xs` | `typographyTokens.fontSize.xs` | 12px |
| `text-sm` | `typographyTokens.fontSize.sm` | 14px |
| `text-base` | `typographyTokens.fontSize.base` | 16px |
| `text-lg` | `typographyTokens.fontSize.lg` | 18px |
| `text-xl` | `typographyTokens.fontSize.xl` | 20px |
| `text-2xl` | `typographyTokens.fontSize['2xl']` | 24px |
| `text-3xl` | `typographyTokens.fontSize['3xl']` | 28px |
| `text-4xl` | `typographyTokens.fontSize['4xl']` | 32px |

| Tailwind Class | DLS Token | Font Family |
|----------------|-----------|-------------|
| `font-display` | `typographyTokens.fontFamily.display` | Outfit_700Bold |
| `font-primary` | `typographyTokens.fontFamily.primary` | Inter_400Regular |
| `font-mono` | `typographyTokens.fontFamily.mono` | JetBrainsMono_400Regular |

### Border Radius

| Tailwind Class | DLS Token | Value |
|----------------|-----------|-------|
| `rounded-sm` | `radiusTokens.sm` | 6px |
| `rounded-md` | `radiusTokens.md` | 8px |
| `rounded-lg` | `radiusTokens.lg` | 12px |
| `rounded-xl` | `radiusTokens.xl` | 16px |
| `rounded-2xl` | `radiusTokens['2xl']` | 20px |
| `rounded-full` | `radiusTokens.full` | 9999px |

### Shadows

| Tailwind Class | DLS Token | Description |
|----------------|-----------|-------------|
| `shadow-xs` | `shadowTokens.xs` | Extra small shadow |
| `shadow-sm` | `shadowTokens.sm` | Small shadow |
| `shadow-md` | `shadowTokens.md` | Medium shadow |
| `shadow-lg` | `shadowTokens.lg` | Large shadow |
| `shadow-xl` | `shadowTokens.xl` | Extra large shadow |
| `shadow-glow-sm` | `shadowTokens.glowSm` | Small glow effect |
| `shadow-glow-md` | `shadowTokens.glowMd` | Medium glow effect |
| `shadow-card` | `shadowTokens.card` | Card shadow |
| `shadow-panel` | `shadowTokens.panel` | Panel shadow |

## Migration Patterns

### Pattern 1: Replace Hard-Coded Colors

**Before:**
```tsx
<View style={{ backgroundColor: '#0a84ff' }}>
  <Text style={{ color: '#FFFFFF' }}>Hello</Text>
</View>
```

**After:**
```tsx
import { Box, Text, useColors } from '@/ui';

const colors = useColors();
<Box backgroundColor={colors.accent.primary}>
  <Text color={colors.foreground.onAccent}>Hello</Text>
</Box>
```

### Pattern 2: Replace Hard-Coded Spacing

**Before:**
```tsx
<View style={{ padding: 16, margin: 8, gap: 12 }}>
  <Text>Content</Text>
</View>
```

**After:**
```tsx
import { Box, Text, spacingTokens } from '@/ui';

<Box padding={4} margin={2} gap={3}>
  <Text>Content</Text>
</Box>
```

### Pattern 3: Replace Hard-Coded Typography

**Before:**
```tsx
<Text style={{ fontSize: 20, fontWeight: '600' }}>
  Title
</Text>
```

**After:**
```tsx
import { Text } from '@/ui';

<Text variant="titleMedium" weight="semibold">
  Title
</Text>
```

### Pattern 4: Replace Tailwind Design Classes with DLS Props

**Before:**
```tsx
<View className="bg-blue-500 p-4 rounded-lg">
  <Text className="text-white text-lg font-semibold">
    Button
  </Text>
</View>
```

**After:**
```tsx
import { Box, Text, useColors } from '@/ui';

const colors = useColors();
<Box 
  backgroundColor={colors.accent.primary}
  padding={4}
  radius="lg"
>
  <Text 
    variant="body"
    weight="semibold"
    color={colors.foreground.onAccent}
  >
    Button
  </Text>
</Box>
```

### Pattern 5: Keep Tailwind for Layout, Use DLS for Design

**Before:**
```tsx
<View className="flex-1 items-center justify-between p-4 bg-white">
  <Text className="text-lg">Title</Text>
</View>
```

**After:**
```tsx
import { Box, Text, useColors } from '@/ui';
import { cn } from '@/ui/utils/cn';

const colors = useColors();
<Box 
  className={cn("flex-1 items-center justify-between")}
  padding={4}
  backgroundColor={colors.background.secondary}
>
  <Text variant="body">Title</Text>
</Box>
```

## Best Practices

### ✅ DO

1. **Use DLS props for design values**
   ```tsx
   <Box padding={4} backgroundColor={colors.background.card} radius="lg">
   ```

2. **Use Tailwind classes for layout utilities**
   ```tsx
   <Box className="flex-1 items-center justify-between">
   ```

3. **Combine both when appropriate**
   ```tsx
   <Box 
     padding={4}
     backgroundColor={colors.background.card}
     className="flex-row items-center gap-2"
   >
   ```

4. **Use DLS Text variants**
   ```tsx
   <Text variant="title" weight="semibold" color={colors.foreground.primary}>
   ```

5. **Use DLS Button variants**
   ```tsx
   <Button variant="primary" size="md">
   ```

### ❌ DON'T

1. **Don't use Tailwind color classes directly**
   ```tsx
   // ❌ Bad
   <View className="bg-blue-500">
   
   // ✅ Good
   <Box backgroundColor={colors.accent.primary}>
   ```

2. **Don't use Tailwind spacing classes for design values**
   ```tsx
   // ❌ Bad
   <View className="p-4">
   
   // ✅ Good
   <Box padding={4}>
   ```

3. **Don't use Tailwind typography classes**
   ```tsx
   // ❌ Bad
   <Text className="text-lg font-semibold">
   
   // ✅ Good
   <Text variant="body" weight="semibold">
   ```

4. **Don't hard-code design values**
   ```tsx
   // ❌ Bad
   <View style={{ padding: 16, backgroundColor: '#FFFFFF' }}>
   
   // ✅ Good
   <Box padding={4} backgroundColor={colors.background.secondary}>
   ```

## Common Migration Scenarios

### Scenario 1: Converting StyleSheet to DLS

**Before:**
```tsx
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
});

<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>
```

**After:**
```tsx
import { Box, Text, useColors } from '@/ui';

const colors = useColors();
<Box padding={4} backgroundColor={colors.background.secondary} radius="lg">
  <Text variant="titleMedium" weight="semibold" color={colors.foreground.primary}>
    Title
  </Text>
</Box>
```

### Scenario 2: Migrating Tailwind-Heavy Component

**Before:**
```tsx
<View className="bg-white p-4 rounded-lg shadow-md">
  <Text className="text-lg font-semibold text-gray-900">
    Card Title
  </Text>
  <Text className="text-sm text-gray-600 mt-2">
    Card description
  </Text>
</View>
```

**After:**
```tsx
import { Card, Text, useColors } from '@/ui';

const colors = useColors();
<Card variant="elevated" padding={4}>
  <Text variant="body" weight="semibold" color={colors.foreground.primary}>
    Card Title
  </Text>
  <Text variant="caption" color={colors.foreground.secondary} style={{ marginTop: spacingTokens[2] }}>
    Card description
  </Text>
</Card>
```

### Scenario 3: Complex Layout with Design Values

**Before:**
```tsx
<View className="flex-row items-center p-4 bg-blue-500 rounded-lg">
  <Text className="text-white text-base font-medium">Button</Text>
</View>
```

**After:**
```tsx
import { Box, Text, Button, useColors } from '@/ui';

// Option 1: Use Button component
<Button variant="primary" size="md">
  Button
</Button>

// Option 2: Use Box with DLS props
const colors = useColors();
<Box 
  flexDirection="row"
  alignItems="center"
  padding={4}
  backgroundColor={colors.accent.primary}
  radius="lg"
>
  <Text 
    variant="body"
    weight="medium"
    color={colors.foreground.onAccent}
  >
    Button
  </Text>
</Box>
```

## Troubleshooting

### Issue: Tailwind classes not working

**Solution:** Ensure NativeWind babel plugin is configured correctly in `babel.config.js`:

```js
module.exports = {
  plugins: [
    ['nativewind/babel'],
    // ... other plugins
  ],
};
```

### Issue: Colors not theme-aware

**Solution:** Use `useColors()` hook instead of direct Tailwind color classes:

```tsx
// ❌ Not theme-aware
<View className="bg-blue-500">

// ✅ Theme-aware
const colors = useColors();
<Box backgroundColor={colors.accent.primary}>
```

### Issue: Spacing doesn't match DLS

**Solution:** Use DLS `padding`/`margin` props instead of Tailwind spacing classes:

```tsx
// ❌ May not match DLS
<View className="p-4">

// ✅ Matches DLS exactly
<Box padding={4}>
```

## Additional Resources

- [Design Language System Documentation](./design-language-system.md)
- [DLS Tokens Reference](../ui/tokens/)
- [Primitive Components Reference](../ui/primitives/)

## Summary

1. **DLS tokens are the source of truth** - All design values come from DLS
2. **Use DLS props for design** - Colors, spacing, typography, radii, shadows
3. **Use Tailwind for layout** - Flex, grid, positioning utilities
4. **Combine when needed** - DLS props + Tailwind classes for complex layouts
5. **Never hard-code** - Always use DLS tokens or Tailwind classes that map to DLS
