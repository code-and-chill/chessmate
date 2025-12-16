---
title: Design Language System
service: app
status: active
last_reviewed: 2025-12-12
type: standard
---

# CHESSMATE DESIGN LANGUAGE SYSTEM (DLS)
## Complete React Native (Expo) UI Framework

> **Status**: Implementation Guide  
> **Created**: November 18, 2025  
> **Style**: ShadCN-Inspired, AI-Aesthetic (Slate/Sky/Violet), Mobile-Optimized

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Primitive Components](#primitive-components)
3. [Chess-Specific Components](#chess-specific-components)
4. [Theme System](#theme-system)
5. [Implementation Guide](#implementation-guide)
6. [Usage Examples](#usage-examples)

---

## UX Principles Alignment & Enforcement

- **Gestalt & Layout as Cognitive Architecture**: use `Stack/VStack/HStack/Grid/LayoutContainer` and `spacingTokens` for proximity/alignment; maintain visual hierarchy in FeatureScreenLayout; avoid ad-hoc `StyleSheet` spacing.
- **Fitts’ Law & Accessibility**: minimum touch targets 44x44; Button sizes (`sm`/`md`/`lg`) meet or exceed; Icon presses should wrap in `InteractivePressable` when clickable.
- **Hick’s Law & Cognitive Load**: limit primary actions per surface (≤3), progressive disclosure; use `FeatureCard`/`Tabs/SegmentedControl` for bounded choices.
- **Jakob’s Law / Material / HIG**: rely on primitives (`Button`, `Input`, `Card`, `Panel`, `Tabs`) and tokens for platform-consistent spacing/typography/colors.
- **Shneiderman & Norman**: provide visible states—pressed/hover/disabled via interactive tokens; use semantic status colors (success/error/warning/info) and feedback components.
- **Atomic Design**: tokens → primitives → components → features; never bypass primitives with raw `View/Text/StyleSheet` in features/routes.
- **Aesthetic-Usability & Motion**: use theme-aware colors, `shadowTokens`, `radiusTokens`; motion presets and `useReducedMotion` gate all micro-interactions.
- **Jobs-To-Be-Done**: choose patterns that shorten user task flow; prefer `FeatureScreenLayout` + cards for hubs, `DetailScreenLayout` for deep tasks.

## DLS Adoption Checklist (features & routes)

- Use only `@/ui/primitives` and `@/ui/components`; no raw `View/Text/StyleSheet` or `TouchableOpacity`.
- Spacing/radii/shadows/colors from tokens (`spacingTokens`, `radii`, `shadowTokens`, semantic colors from `useThemeTokens`); no hex/rgba literals.
- Buttons/pressables: use `Button` or `InteractivePressable`; respect min 44px height and disabled/loading states.
- Layout: use `Stack/VStack/HStack/Grid/LayoutContainer`; align to breakpoints from `tokens/breakpoints`.
- Motion: use motion presets; wrap animations with `useReducedMotion`.
- Chess UI: use board/piece theme tokens; avoid literal square colors or overlay colors.
- Docs: when adding a pattern, update this file and export via `ui/index.ts`; add tests for primitives/components.

---

## Design Tokens

> **Note (DEPRECATION):** The legacy file `app/ui/design-tokens.ts` has been deprecated. Please import tokens from the canonical files under `app/ui/tokens/` (for example `app/ui/tokens/colors.ts`, `app/ui/tokens/typography.ts`, `app/ui/tokens/spacing.ts`). The repository includes a short compatibility shim in `app/ui/design-tokens.ts` while code is migrated.

Example canonical imports:

```ts
import { semanticColors } from '@/ui/tokens/colors';
import { typographyTokens, textVariants } from '@/ui/tokens/typography';
import { spacingTokens } from '@/ui/tokens/spacing';
```


### 1. Color Tokens

```typescript
// app/ui/tokens/colors.ts

export type ColorToken = {
  light: string;
  dark: string;
};

export const colorTokens = {
  neutral: {
    // Slate Palette (Cooler, Tech/AI Feel)
    50: { light: '#F8FAFC', dark: '#020617' },
    100: { light: '#F1F5F9', dark: '#0F172A' },
    200: { light: '#E2E8F0', dark: '#1E293B' },
    300: { light: '#CBD5E1', dark: '#334155' },
    400: { light: '#94A3B8', dark: '#475569' },
    500: { light: '#64748B', dark: '#94A3B8' },
    600: { light: '#475569', dark: '#CBD5E1' },
    700: { light: '#334155', dark: '#E2E8F0' },
    800: { light: '#1E293B', dark: '#F1F5F9' },
    900: { light: '#0F172A', dark: '#F8FAFC' },
  },
  blue: {
    50: { light: '#F0F9FF', dark: '#082F49' },
    100: { light: '#E0F2FE', dark: '#0C4A6E' },
    200: { light: '#BAE6FD', dark: '#075985' },
    300: { light: '#7DD3FC', dark: '#0369A1' },
    400: { light: '#38BDF8', dark: '#0284C7' }, // Sky Blue - More Electric
    500: { light: '#0EA5E9', dark: '#38BDF8' },
    600: { light: '#0284C7', dark: '#7DD3FC' },
    700: { light: '#0369A1', dark: '#BAE6FD' },
    800: { light: '#075985', dark: '#E0F2FE' },
    900: { light: '#0C4A6E', dark: '#F0F9FF' },
  },
  purple: {
    50: { light: '#F5F3FF', dark: '#2E1065' },
    100: { light: '#EDE9FE', dark: '#4C1D95' },
    200: { light: '#DDD6FE', dark: '#5B21B6' },
    300: { light: '#C4B5FD', dark: '#6D28D9' },
    400: { light: '#A78BFA', dark: '#7C3AED' }, // Violet - More Neon
    500: { light: '#8B5CF6', dark: '#A78BFA' },
    600: { light: '#7C3AED', dark: '#C4B5FD' },
    700: { light: '#6D28D9', dark: '#DDD6FE' },
    800: { light: '#5B21B6', dark: '#EDE9FE' },
    900: { light: '#4C1D95', dark: '#F5F3FF' },
  },
  green: { /* success palette */ },
  red: { /* error palette */ },
  amber: { /* warning palette */ },
  cyan: { /* info palette */ },
};

export const getColor = (token: ColorToken | string, isDark: boolean): string => {
  if (typeof token === 'string') return token;
  return isDark ? token.dark : token.light;
};

export const semanticColors = (isDark: boolean) => ({
  background: {
    primary: getColor(colorTokens.neutral[50], isDark),
    secondary: getColor(colorTokens.neutral[100], isDark),
    tertiary: getColor(colorTokens.neutral[200], isDark),
  },
  foreground: {
    primary: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[700], isDark),
    tertiary: getColor(colorTokens.neutral[600], isDark),
    muted: getColor(colorTokens.neutral[500], isDark),
  },
  accent: {
    primary: getColor(colorTokens.blue[600], isDark),
    secondary: getColor(colorTokens.purple[600], isDark),
  },
  success: getColor(colorTokens.green[600], isDark),
  error: getColor(colorTokens.red[600], isDark),
  warning: getColor(colorTokens.amber[500], isDark),
  info: getColor(colorTokens.cyan[600], isDark),
});
```

### 2. Typography Tokens

```typescript
// app/ui/tokens/typography.ts

/**
 * EXPO FONT SYSTEM (PRODUCTION)
 * 
 * Using Expo Google Fonts for reliable cross-platform rendering:
 * 
 * Installation:
 * ```bash
 * npx expo install expo-font \
 *   @expo-google-fonts/outfit \
 *   @expo-google-fonts/inter \
 *   @expo-google-fonts/jetbrains-mono
 * ```
 * 
 * Font Loading (App.tsx):
 * ```tsx
 * import { useFonts } from 'expo-font';
 * import {
 *   Outfit_500Medium,
 *   Outfit_600SemiBold,
 *   Outfit_700Bold,
 * } from '@expo-google-fonts/outfit';
 * import {
 *   Inter_400Regular,
 *   Inter_500Medium,
 *   Inter_600SemiBold,
 *   Inter_700Bold,
 * } from '@expo-google-fonts/inter';
 * import {
 *   JetBrainsMono_400Regular,
 *   JetBrainsMono_500Medium,
 *   JetBrainsMono_700Bold,
 * } from '@expo-google-fonts/jetbrains-mono';
 * 
 * const [fontsLoaded] = useFonts({
 *   Outfit_500Medium,
 *   Outfit_600SemiBold,
 *   Outfit_700Bold,
 *   Inter_400Regular,
 *   Inter_500Medium,
 *   Inter_600SemiBold,
 *   Inter_700Bold,
 *   JetBrainsMono_400Regular,
 *   JetBrainsMono_500Medium,
 *   JetBrainsMono_700Bold,
 * });
 * ```
 * 
 * Font Roles:
 * - Outfit: Display & Headings (geometric, modern)
 * - Inter: Body & UI text (excellent readability)
 * - JetBrains Mono: Chess notation & code
 */
export const typographyTokens = {
  fontFamily: {
    // Display & Headings
    display: 'Outfit_700Bold',
    displayMedium: 'Outfit_600SemiBold',
    displayLight: 'Outfit_500Medium',
    
    // Body & UI
    primary: 'Inter_400Regular',
    primaryMedium: 'Inter_500Medium',
    primarySemiBold: 'Inter_600SemiBold',
    primaryBold: 'Inter_700Bold',
    
    // Code & Notation
    mono: 'JetBrainsMono_400Regular',
    monoMedium: 'JetBrainsMono_500Medium',
    monoBold: 'JetBrainsMono_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// Variant presets for quick application
export const textVariants = {
  heading: { fontSize: 30, fontWeight: '700', lineHeight: 1.2 },
  subheading: { fontSize: 20, fontWeight: '600', lineHeight: 1.4 },
  title: { fontSize: 18, fontWeight: '600', lineHeight: 1.4 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 1.5 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 1.5 },
  label: { fontSize: 14, fontWeight: '600', lineHeight: 1.4 },
  hint: { fontSize: 12, fontWeight: '400', lineHeight: 1.4 },
};
```

### 3. Spacing Tokens

```typescript
// app/ui/tokens/spacing.ts

/**
 * Production spacing scale: 4px base unit
 * 
 * Rationale: 4px base provides better mobile UX with touch-friendly spacing.
 * Updated Dec 2025 to match implementation.
 */
export const spacingTokens = {
  0: 0,
  1: 4,   // 4px - xs, tight spacing
  2: 8,   // 8px - sm, compact spacing
  3: 12,  // 12px - md, comfortable spacing
  4: 16,  // 16px - lg, relaxed spacing
  5: 24,  // 24px - xl, spacious
  6: 32,  // 32px - 2xl, very spacious
  7: 40,  // 40px - 3xl, generous
  8: 48,  // 48px - 4xl, large gaps
  9: 64,  // 64px - 5xl, section dividers
  10: 80, // 80px - 6xl, hero spacing
  12: 96, // 96px - 7xl, mega spacing
};

// Semantic spacing helpers
export const spacingScale = {
  gutter: spacingTokens[6], // 16
  gap: spacingTokens[5], // 12
  padding: spacingTokens[6], // 16
  margin: spacingTokens[5], // 12
  cardPadding: spacingTokens[6], // 16
  rowHeight: 56,
  buttonHeight: 44,
  inputHeight: 44,
};
```

### 4. Radius Tokens

```typescript
// app/ui/tokens/radii.ts

/**
 * Production radius scale: Tight, modern radii
 * 
 * Rationale: Tighter radii (4/8/12) provide modern aesthetic.
 * Verified Dec 2025 via component usage audit - widely adopted.
 */
export const radiusTokens = {
  none: 0,
  sm: 4,   // 4px - small elements (badges, tags)
  md: 8,   // 8px - buttons, inputs
  lg: 12,  // 12px - cards, panels
  xl: 16,  // 16px - modals, drawers
  '2xl': 20, // 20px - hero cards
  full: 9999, // circular avatars
};

// Semantic radius for different component types
export const radiusScale = {
  button: radiusTokens.md, // 10
  card: radiusTokens.lg, // 16
  modal: radiusTokens.lg, // 16
  badge: radiusTokens.sm, // 6
  input: radiusTokens.md, // 10
};
```

### 5. Shadow Tokens (AI-Aesthetic: Soft & Diffused)

```typescript
// app/ui/tokens/shadows.ts

export const shadowTokens = {
  none: 'none',
  // Glow effects (AI Aesthetic)
  glowSm: {
    shadowColor: '#38BDF8', // Sky 400
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  glowMd: {
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  glowLg: {
    shadowColor: '#A78BFA', // Violet 400
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  panel: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 12,
  },
};
```

### 6. Motion Tokens

```typescript
// app/ui/tokens/motion.ts

export const motionTokens = {
  duration: {
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Micro-interaction presets
export const microInteractions = {
  scalePress: 0.98,
  scaleHover: 1.01,
  opacityDisabled: 0.5,
};
```

---

## Primitive Components

### 1. Box Component

```typescript
// app/ui/primitives/Box.tsx

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacingTokens, radiusTokens, shadowTokens } from '../tokens';

type BoxProps = {
  as?: React.ElementType;
  children?: React.ReactNode;
  padding?: number;
  margin?: number;
  radius?: number;
  shadow?: string;
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
  flexDirection?: 'row' | 'column';
  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  gap?: number;
  style?: ViewStyle;
} & React.ComponentProps<typeof View>;

export const Box = React.forwardRef<View, BoxProps>(
  (
    {
      as: Component = View,
      children,
      padding,
      margin,
      radius,
      shadow,
      borderColor,
      borderWidth,
      backgroundColor,
      flexDirection = 'column',
      justifyContent,
      alignItems,
      gap,
      style,
      ...rest
    },
    ref
  ) => {
    const boxStyle: ViewStyle = {
      flexDirection,
      justifyContent,
      alignItems,
      gap: gap ? spacingTokens[gap as keyof typeof spacingTokens] : undefined,
      padding: padding ? spacingTokens[padding as keyof typeof spacingTokens] : undefined,
      margin: margin ? spacingTokens[margin as keyof typeof spacingTokens] : undefined,
      borderRadius: radius ? radiusTokens[radius as keyof typeof radiusTokens] : undefined,
      borderColor,
      borderWidth,
      backgroundColor,
      ...(shadow && typeof shadowTokens[shadow as keyof typeof shadowTokens] === 'object'
        ? shadowTokens[shadow as keyof typeof shadowTokens]
        : {}),
    };

    return (
      <Component ref={ref} style={[boxStyle, style]} {...rest}>
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';
```

### 2. Text Component

```typescript
// app/ui/primitives/Text.tsx

import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { typographyTokens, textVariants } from '../tokens';

type TextVariant = keyof typeof textVariants;

type TextProps = {
  children?: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  weight?: keyof typeof typographyTokens.fontWeight;
  size?: keyof typeof typographyTokens.fontSize;
  style?: TextStyle;
} & React.ComponentProps<typeof RNText>;

export const Text = React.forwardRef<RNText, TextProps>(
  (
    {
      children,
      variant = 'body',
      color,
      weight,
      size,
      style,
      ...rest
    },
    ref
  ) => {
    const variantStyle = textVariants[variant];
    const textStyle: TextStyle = {
      fontFamily: typographyTokens.fontFamily.primary,
      ...variantStyle,
      ...(weight && { fontWeight: typographyTokens.fontWeight[weight] }),
      ...(size && { fontSize: typographyTokens.fontSize[size] }),
      color: color || '#000',
    };

    return (
      <RNText ref={ref} style={[textStyle, style]} {...rest}>
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';
```

### 3. Button Component

```typescript
// app/ui/primitives/Button.tsx

import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Box } from './Box';
import { radiusTokens, spacingTokens } from '../tokens';

type ButtonVariant = 'solid' | 'outline' | 'subtle' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = PressableProps & {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  color?: string;
};

const buttonStyles = {
  solid: {
    bg: '#3B82F6',
    text: '#FFF',
    border: 'none',
  },
  outline: {
    bg: 'transparent',
    text: '#3B82F6',
    border: '#3B82F6',
  },
  subtle: {
    bg: 'rgba(59, 130, 246, 0.1)',
    text: '#3B82F6',
    border: 'none',
  },
  ghost: {
    bg: 'transparent',
    text: '#3B82F6',
    border: 'none',
  },
};

const sizeStyles = {
  sm: { height: 32, paddingH: 3, fontSize: 'sm' as const },
  md: { height: 44, paddingH: 4, fontSize: 'base' as const },
  lg: { height: 56, paddingH: 6, fontSize: 'lg' as const },
};

export const Button = React.forwardRef<typeof Pressable, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      size = 'md',
      icon,
      isLoading,
      disabled,
      color,
      style,
      ...rest
    },
    ref
  ) => {
    const styles = buttonStyles[variant];
    const sizeConfig = sizeStyles[size];

    return (
      <Pressable
        ref={ref}
        disabled={disabled || isLoading}
        style={[
          {
            height: sizeConfig.height,
            paddingHorizontal: spacingTokens[sizeConfig.paddingH as keyof typeof spacingTokens],
            borderRadius: radiusTokens.md,
            backgroundColor: color || styles.bg,
            borderWidth: styles.border !== 'none' ? 1 : 0,
            borderColor: styles.border !== 'none' ? styles.border : undefined,
            opacity: disabled ? 0.5 : 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacingTokens[2],
          },
          style,
        ]}
        {...rest}
      >
        {icon}
        {typeof children === 'string' ? (
          <Text
            size={sizeConfig.fontSize}
            weight="semibold"
            color={color ? '#FFF' : styles.text}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
```

### 4. Card Component

```typescript
// app/ui/primitives/Card.tsx

import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from './Box';

type CardProps = {
  children: React.ReactNode;
  padding?: number;
  shadow?: 'card' | 'panel' | 'floating';
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
};

export const Card = React.forwardRef<React.ComponentRef<typeof Box>, CardProps>(
  (
    {
      children,
      padding = 6,
      shadow = 'card',
      borderColor,
      borderWidth = 0,
      style,
    },
    ref
  ) => {
    return (
      <Box
        ref={ref}
        padding={padding}
        radius="lg"
        shadow={shadow}
        borderColor={borderColor}
        borderWidth={borderWidth}
        backgroundColor="#FAFAFA"
        style={style}
      >
        {children}
      </Box>
    );
  }
);

Card.displayName = 'Card';
```

### 5. Panel Component (Translucent/AI-Aesthetic)

```typescript
// app/ui/primitives/Panel.tsx

import React from 'react';
import { ViewStyle } from 'react-native';
import { Box } from './Box';

type PanelDensity = 'light' | 'medium' | 'dark';

type PanelProps = {
  children: React.ReactNode;
  density?: PanelDensity;
  padding?: number;
  style?: ViewStyle;
};

const densityMap = {
  light: 'rgba(255, 255, 255, 0.8)',
  medium: 'rgba(255, 255, 255, 0.6)',
  dark: 'rgba(0, 0, 0, 0.05)',
};

export const Panel = React.forwardRef<React.ComponentRef<typeof Box>, PanelProps>(
  (
    {
      children,
      density = 'medium',
      padding = 6,
      style,
    },
    ref
  ) => {
    return (
      <Box
        ref={ref}
        padding={padding}
        radius="lg"
        backgroundColor={densityMap[density]}
        borderColor="rgba(0, 0, 0, 0.08)"
        borderWidth={1}
        style={style}
      >
        {children}
      </Box>
    );
  }
);

Panel.displayName = 'Panel';
```

### Additional Primitives

```typescript
// app/ui/primitives/Input.tsx
// Similar pattern with focus states, left/right accessories

// app/ui/primitives/Tag.tsx
// Chip/badge component for labels

// app/ui/primitives/Avatar.tsx
// User initials with fallback

// app/ui/primitives/Divider.tsx
// Light neutral line separator

// app/ui/primitives/Surface.tsx
// Gradient backdrop for AI aesthetic
```

---

## Chess-Specific Components

### 1. MatchCard

```typescript
// app/ui/components/MatchCard.tsx

import React, { useMemo } from 'react';
import { StyleSheet, Animated, ViewStyle } from 'react-native';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Card } from '../primitives/Card';
import { Avatar } from '../primitives/Avatar';
import { Tag } from '../primitives/Tag';

type MatchStatus = 'active' | 'completed' | 'pending';

type MatchCardProps = {
  player1: { name: string; avatar: string; rating: number };
  player2: { name: string; avatar: string; rating: number };
  score1: number;
  score2: number;
  status: MatchStatus;
  onPress?: () => void;
  animated?: boolean;
};

export const MatchCard = React.forwardRef<typeof Card, MatchCardProps>(
  (
    {
      player1,
      player2,
      score1,
      score2,
      status,
      onPress,
      animated = true,
    },
    ref
  ) => {
    const statusColors = {
      active: '#3B82F6',
      completed: '#16A34A',
      pending: '#F59E0B',
    };

    const borderAnimationValue = useMemo(() => new Animated.Value(0), []);

    React.useEffect(() => {
      if (animated && status === 'active') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(borderAnimationValue, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(borderAnimationValue, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }
    }, [animated, status]);

    return (
      <Card
        ref={ref}
        borderColor={statusColors[status]}
        borderWidth={status === 'active' ? 2 : 1}
        onPress={onPress}
        style={{ cursor: 'pointer' }}
      >
        <Box gap={4}>
          {/* Header: Players */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box flexDirection="row" alignItems="center" gap={3}>
              <Avatar name={player1.name} />
              <Box>
                <Text variant="title" weight="semibold">
                  {player1.name}
                </Text>
                <Text variant="caption" color="#737373">
                  Rating: {player1.rating}
                </Text>
              </Box>
            </Box>

            <Box alignItems="center">
              <Text variant="heading" weight="bold" color="#3B82F6">
                {score1} - {score2}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap={3}>
              <Box>
                <Text variant="title" weight="semibold">
                  {player2.name}
                </Text>
                <Text variant="caption" color="#737373">
                  Rating: {player2.rating}
                </Text>
              </Box>
              <Avatar name={player2.name} />
            </Box>
          </Box>

          {/* Status Tag */}
          <Box flexDirection="row" justifyContent="center">
            <Tag label={status.charAt(0).toUpperCase() + status.slice(1)} color={statusColors[status]} />
          </Box>
        </Box>
      </Card>
    );
  }
);

MatchCard.displayName = 'MatchCard';
```

### 2. ScoreInput

```typescript
// app/ui/components/ScoreInput.tsx

import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Button } from '../primitives/Button';

type ScoreInputProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
};

export const ScoreInput: React.FC<ScoreInputProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
}) => {
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <Box alignItems="center" gap={3}>
      {label && (
        <Text variant="label" color="#525252">
          {label}
        </Text>
      )}

      <Box
        flexDirection="row"
        alignItems="center"
        gap={4}
        padding={3}
        radius="md"
        backgroundColor="rgba(59, 130, 246, 0.1)"
      >
        <Button variant="outline" size="sm" onPress={handleDecrement}>
          −
        </Button>

        <Text variant="heading" weight="bold" color="#3B82F6" style={{ minWidth: 50, textAlign: 'center' }}>
          {value}
        </Text>

        <Button variant="outline" size="sm" onPress={handleIncrement}>
          +
        </Button>
      </Box>
    </Box>
  );
};
```

### 3. PlayerRow

```typescript
// app/ui/components/PlayerRow.tsx

import React from 'react';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Avatar } from '../primitives/Avatar';

type PerformanceType = 'win' | 'loss' | 'draw';

type PlayerRowProps = {
  name: string;
  avatar: string;
  rating: number;
  performance?: PerformanceType;
  wins?: number;
  losses?: number;
  draws?: number;
};

const performanceColors = {
  win: '#16A34A',
  loss: '#DC2626',
  draw: '#F59E0B',
};

export const PlayerRow: React.FC<PlayerRowProps> = ({
  name,
  avatar,
  rating,
  performance,
  wins,
  losses,
  draws,
}) => {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      padding={4}
      borderBottomWidth={1}
      borderColor="#E8E8E8"
    >
      <Box flexDirection="row" alignItems="center" gap={3}>
        <Avatar name={name} />
        <Box>
          <Text variant="title" weight="semibold">
            {name}
          </Text>
          <Text variant="caption" color="#737373">
            Rating: {rating}
          </Text>
        </Box>
      </Box>

      {performance && (
        <Box
          padding={2}
          radius="sm"
          backgroundColor={performanceColors[performance] + '20'}
        >
          <Text variant="label" weight="bold" color={performanceColors[performance]}>
            {performance.toUpperCase()}
          </Text>
        </Box>
      )}

      {(wins !== undefined || losses !== undefined || draws !== undefined) && (
        <Box flexDirection="row" gap={3}>
          {wins !== undefined && (
            <Text variant="caption" color="#16A34A" weight="semibold">
              W: {wins}
            </Text>
          )}
          {losses !== undefined && (
            <Text variant="caption" color="#DC2626" weight="semibold">
              L: {losses}
            </Text>
          )}
          {draws !== undefined && (
            <Text variant="caption" color="#F59E0B" weight="semibold">
              D: {draws}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};
```

### 4. TournamentHeader

```typescript
// app/ui/components/TournamentHeader.tsx

import React from 'react';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

type TournamentHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
};

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  title,
  subtitle,
  badge,
}) => {
  return (
    <Box
      padding={6}
      backgroundColor="rgba(59, 130, 246, 0.05)"
      borderBottomWidth={1}
      borderColor="rgba(59, 130, 246, 0.2)"
    >
      <Box gap={2}>
        <Box flexDirection="row" alignItems="center" gap={3}>
          <Text variant="heading" weight="bold" color="#171717">
            {title}
          </Text>
          {badge && (
            <Box
              padding={2}
              radius="sm"
              backgroundColor="#3B82F6"
            >
              <Text variant="caption" weight="semibold" color="#FAFAFA">
                {badge}
              </Text>
            </Box>
          )}
        </Box>
        {subtitle && (
          <Text variant="body" color="#737373">
            {subtitle}
          </Text>
        )}
      </Box>
    </Box>
  );
};
```

### 5. RoundSelector

```typescript
// app/ui/components/RoundSelector.tsx

import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

type RoundSelectorProps = {
  rounds: string[];
  selected: string;
  onSelect: (round: string) => void;
};

export const RoundSelector: React.FC<RoundSelectorProps> = ({
  rounds,
  selected,
  onSelect,
}) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Box flexDirection="row" gap={2} padding={4}>
        {rounds.map((round) => (
          <Pressable key={round} onPress={() => onSelect(round)}>
            <Box
              padding={3}
              radius="md"
              backgroundColor={selected === round ? '#3B82F6' : '#F3F3F3'}
              borderWidth={selected === round ? 0 : 1}
              borderColor="#E8E8E8"
            >
              <Text
                variant="label"
                weight="semibold"
                color={selected === round ? '#FAFAFA' : '#171717'}
              >
                {round}
              </Text>
            </Box>
          </Pressable>
        ))}
      </Box>
    </ScrollView>
  );
};
```

### 6. ActionBar

```typescript
// app/ui/components/ActionBar.tsx

import React from 'react';
import { Box } from '../primitives/Box';
import { Button } from '../primitives/Button';

type ActionBarProps = {
  actions: Array<{
    label: string;
    onPress: () => void;
    variant?: 'solid' | 'outline' | 'subtle' | 'ghost';
    icon?: React.ReactNode;
  }>;
};

export const ActionBar: React.FC<ActionBarProps> = ({ actions }) => {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-around"
      alignItems="center"
      padding={4}
      backgroundColor="#FAFAFA"
      borderTopWidth={1}
      borderTopColor="#E8E8E8"
      gap={2}
    >
      {actions.map((action, index) => (
        <Box key={index} flex={1}>
          <Button
            variant={action.variant || 'solid'}
            onPress={action.onPress}
            icon={action.icon}
          >
            {action.label}
          </Button>
        </Box>
      ))}
    </Box>
  );
};
```

---

## Theme System

### 1. Theme Provider & Hook

```typescript
// app/ui/hooks/useThemeTokens.ts

import { createContext, useContext } from 'react';
import { semanticColors } from '../tokens/colors';

export type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  colors: ReturnType<typeof semanticColors>;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeTokens = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeTokens must be used within ThemeProvider');
  }
  return context;
};

export const useColors = () => {
  const { colors } = useThemeTokens();
  return colors;
};

export const useIsDark = () => {
  const { isDark } = useThemeTokens();
  return isDark;
};
```

### 2. Theme Provider Component

```typescript
// app/ui/theme/ThemeProvider.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext, ThemeMode } from '../hooks/useThemeTokens';
import { semanticColors } from '../tokens/colors';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'auto',
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const isDark = useMemo(() => {
    if (mode === 'auto') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const colors = useMemo(() => semanticColors(isDark), [isDark]);

  const value = {
    mode,
    isDark,
    setMode,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## Implementation Guide

### Step 1: Create Directory Structure

```bash
app/ui/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radii.ts
│   ├── shadows.ts
│   ├── motion.ts
│   └── index.ts
├── primitives/
│   ├── Box.tsx
│   ├── Text.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Panel.tsx
│   ├── Input.tsx
│   ├── Tag.tsx
│   ├── Avatar.tsx
│   ├── Divider.tsx
│   └── index.ts
├── components/
│   ├── MatchCard.tsx
│   ├── ScoreInput.tsx
│   ├── PlayerRow.tsx
│   ├── TournamentHeader.tsx
│   ├── RoundSelector.tsx
│   ├── ActionBar.tsx
│   └── index.ts
├── hooks/
│   ├── useThemeTokens.ts
│   └── index.ts
├── theme/
│   ├── ThemeProvider.tsx
│   └── index.ts
└── index.ts
```

### Step 2: Token Export Index

```typescript
// app/ui/tokens/index.ts

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radii';
export * from './shadows';
export * from './motion';
```

### Step 3: Primitives Export Index

```typescript
// app/ui/primitives/index.ts

export { Box } from './Box';
export { Text } from './Text';
export { Button } from './Button';
export { Card } from './Card';
export { Panel } from './Panel';
export { Input } from './Input';
export { Tag } from './Tag';
export { Avatar } from './Avatar';
export { Divider } from './Divider';
```

### Step 4: Components Export Index

```typescript
// app/ui/components/index.ts

export { MatchCard } from './MatchCard';
export { ScoreInput } from './ScoreInput';
export { PlayerRow } from './PlayerRow';
export { TournamentHeader } from './TournamentHeader';
export { RoundSelector } from './RoundSelector';
export { ActionBar } from './ActionBar';
```

---

## Usage Examples

### Example 1: Basic Match Screen

```typescript
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import {
  Box,
  Text,
  MatchCard,
  TournamentHeader,
  ActionBar,
  useThemeTokens,
} from '@/ui';

export const MatchesScreen = () => {
  const { colors } = useThemeTokens();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView>
        <TournamentHeader
          title="Chessmate Tournament"
          subtitle="Round 3 of 8"
          badge="ACTIVE"
        />

        <Box padding={4} gap={4}>
          <MatchCard
            player1={{ name: 'Alice', avatar: 'A', rating: 2100 }}
            player2={{ name: 'Bob', avatar: 'B', rating: 2050 }}
            score1={2}
            score2={1}
            status="active"
          />

          <MatchCard
            player1={{ name: 'Charlie', avatar: 'C', rating: 1950 }}
            player2={{ name: 'Diana', avatar: 'D', rating: 2000 }}
            score1={3}
            score2={2}
            status="completed"
          />
        </Box>

        <ActionBar
          actions={[
            { label: 'Previous', onPress: () => console.log('Prev') },
            { label: 'Next', onPress: () => console.log('Next') },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
```

### Example 2: Score Input Form

```typescript
import React, { useState } from 'react';
import { Box, Text, ScoreInput, Button } from '@/ui';

export const UpdateScoresForm = () => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  return (
    <Box padding={6} gap={6}>
      <Text variant="heading">Update Scores</Text>

      <Box gap={4}>
        <ScoreInput
          label="Player 1"
          value={score1}
          onChange={setScore1}
          max={10}
        />

        <ScoreInput
          label="Player 2"
          value={score2}
          onChange={setScore2}
          max={10}
        />
      </Box>

      <Button onPress={() => console.log('Save', { score1, score2 })}>
        Save Scores
      </Button>
    </Box>
  );
};
```

---

## Feature Screen Layout Pattern (Standardized)

### Overview

A consistent, modern pattern for all feature screens in the app. This pattern provides a unified UX across Play, Puzzle, Learn, Social, and Settings tabs. Uses theme system for dynamic colors that adapt to light/dark mode.

### Core Pattern Elements

#### 1. Hub View Structure

```typescript
// Pattern: Hub view with interactive cards

export default function TabScreen() {
  const [mode, setMode] = useState<Mode>('hub');
  
  if (mode === 'hub') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gradientBg} />
        <VStack gap={8} style={styles.content}>
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <VStack gap={3} style={styles.headerSection}>
              <Text style={styles.title}>Screen Title</Text>
              <Text style={styles.subtitle}>Descriptive subtitle</Text>
            </VStack>
          </Animated.View>

          {/* Optional Stats Row */}
          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
            <HStack gap={3} style={styles.statsRow}>
              <Card variant="elevated" size="sm" style={styles.statCard}>
                <Text style={styles.statValue}>🔥 7</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </Card>
            </HStack>
          </Animated.View>

          {/* Main Cards */}
          <VStack gap={4} style={styles.cardsContainer}>
            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <Card variant="elevated" size="lg" hoverable pressable>
                <TouchableOpacity
                  style={styles.modeCardInner}
                  onPress={() => setMode('detail')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modeIcon}>🎯</Text>
                  <VStack gap={1} style={{ flex: 1 }}>
                    <Text style={styles.modeTitle}>Feature Title</Text>
                    <Text style={styles.modeDescription}>Description text</Text>
                    <Text style={styles.cardProgress}>Progress info</Text>
                  </VStack>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }
  
  // Detail views...
}
```

#### 2. Standardized Styles

```typescript
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FA',
  },
  
  // Content Layout
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#667EEA',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  
  // Stats Row (Optional)
  statsRow: {
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: '#667EEA',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Cards Container
  cardsContainer: {
    width: '100%',
  },
  modeCard: {
    width: '100%',
  },
  modeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    padding: 4,
  },
  modeIcon: {
    fontSize: 48,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardProgress: {
    fontSize: 13,
    color: '#667EEA',
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Detail Views
  detailContent: {
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '600',
  },
  
  // Loading State
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loaderText: {
    marginTop: 20,
    fontSize: 17,
    color: '#6B7280',
    fontWeight: '500',
  },
});
```

#### 3. Animation Patterns

```typescript
// Staggered entrance animations
<Animated.View entering={FadeInUp.duration(400).delay(100)}>
  {/* Header */}
</Animated.View>

<Animated.View entering={FadeInDown.duration(400).delay(150)}>
  {/* Stats */}
</Animated.View>

<Animated.View entering={FadeInDown.duration(500).delay(200)}>
  {/* First Card */}
</Animated.View>

<Animated.View entering={FadeInDown.duration(500).delay(300)}>
  {/* Second Card */}
</Animated.View>

// Pattern: Increment delay by 100ms for each subsequent card
```

#### 4. Required Imports

```typescript
import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack } from '@/ui';
```

### Design Specifications

#### Color Palette
- **Primary Accent**: `#667EEA` (Blue-Purple)
- **Background**: `#F8F9FA` (Light Gray)
- **Text Primary**: `#1F2937` (Dark Gray)
- **Text Secondary**: `#6B7280` (Medium Gray)

#### Typography Scale
- **Title**: 36px, Weight 800, Letter-spacing -0.5
- **Subtitle**: 17px, Weight 500, Line-height 24
- **Card Title**: 20px, Weight 700
- **Card Description**: 15px, Line-height 20
- **Progress Text**: 13px, Weight 600

#### Spacing
- **Content Padding**: 24px
- **Card Gap**: 16px (spacingTokens[4])
- **Section Gap**: 32px (spacingTokens[8])
- **Max Width**: 600px (centered)

#### Card Specifications
- **Variant**: `elevated` (default), `gradient` (for selected states)
- **Size**: `lg` for main cards, `sm` for stat cards
- **Props**: `hoverable`, `pressable`, `animated`
- **Inner Padding**: 4px (allows content to breathe)

### Usage Guidelines

#### ✅ DO:
- Use SafeAreaView for all tab screens
- Center content with max-width 600px
- Animate entries with staggered delays
- Use Card components with proper variants
- Include loading states with descriptive text
- Follow the exact color palette
- Maintain consistent spacing

#### ❌ DON'T:
- Hard-code colors (use theme tokens)
- Skip animations on hub views
- Use ScrollView on hub views (use SafeAreaView)
- Create custom card styles (use Card component)
- Forget to add activeOpacity={0.9} on TouchableOpacity
- Use inline styles for layout (use StyleSheet)

### Implementation Checklist

- [ ] Import required components (SafeAreaView, Animated, Card, VStack)
- [ ] Set up mode state management
- [ ] Create hub view with centered content
- [ ] Add header with title and subtitle
- [ ] Add optional stats row with Card components
- [ ] Create 3-4 main feature cards
- [ ] Add staggered FadeIn animations (100ms increments)
- [ ] Implement detail views with back button
- [ ] Add loading state with spinner and text
- [ ] Use standardized styles from pattern
- [ ] Test on both iOS and Android
- [ ] Verify responsive behavior

### Reusable Components

To reduce boilerplate and enforce consistency, use these components from `@/ui/components`:

#### FeatureScreenLayout
Container component with standardized layout, header, and animations. **Theme-aware** - automatically adapts colors to light/dark mode.

```typescript
import { FeatureScreenLayout, FeatureCard, StatCard } from '@/ui/components';

<FeatureScreenLayout
  title="Play Chess"
  subtitle="Choose your game mode to get started"
  statsRow={
    <HStack gap={3}>
      <StatCard value="🔥 7" label="Day Streak" />
      <StatCard value="⚡ 1450" label="Rating" />
    </HStack>
  }
>
  <FeatureCard
    icon="🌐"
    title="Online Play"
    description="Find opponents worldwide"
    progress="1245 rating • 34 games"
    onPress={() => setMode('online')}
    delay={200}
  />
  {/* More cards... */}
</FeatureScreenLayout>
```

#### FeatureCard
Interactive card with icon, title, description, and optional progress text. **Theme-aware** - colors adapt automatically.

**Props:**
- `icon`: Emoji string (e.g., "🌐")
- `title`: Card title
- `description`: Descriptive text
- `progress?`: Optional progress/info text
- `onPress`: Press handler
- `delay?`: Animation delay (stagger by 100ms)
- `variant?`: "elevated" (default) or "gradient"

#### StatCard
Stat display card for metrics row. **Theme-aware** - uses accent color from theme.

**Props:**
- `value`: Display value (can include emoji)
- `label`: Label text below value

### Before/After Comparison

**Before (Manual Implementation - 150+ lines):**
```typescript
export default function PlayTab() {
  const [mode, setMode] = useState<PlayMode>('hub');

  if (mode === 'hub') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gradientBg} />
        <VStack gap={8} style={styles.content}>
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <VStack gap={3} style={styles.headerSection}>
              <Text style={styles.title}>Play Chess</Text>
              <Text style={styles.subtitle}>Choose your game mode</Text>
            </VStack>
          </Animated.View>
          
          <VStack gap={4} style={styles.cardsContainer}>
            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <Card variant="elevated" size="lg" hoverable pressable>
                <TouchableOpacity style={styles.modeCardInner} onPress={() => setMode('online')}>
                  <Text style={styles.modeIcon}>🌐</Text>
                  <VStack gap={1}>
                    <Text style={styles.modeTitle}>Online Play</Text>
                    <Text style={styles.modeDescription}>Find opponents worldwide</Text>
                  </VStack>
                </TouchableOpacity>
              </Card>
            </Animated.View>
            {/* Repeat for each card... */}
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }
  // ... rest of component
}

// 90+ lines of StyleSheet definitions...
```

**After (Component-Based - 30 lines):**
```typescript
import { TabHubScreen, TabHubCard } from '@/ui/components';

export default function PlayTab() {
  const [mode, setMode] = useState<PlayMode>('hub');

  if (mode === 'hub') {
    return (
      <TabHubScreen
        title="Play Chess"
        subtitle="Choose your game mode to get started"
      >
        <TabHubCard
          icon="🌐"
          title="Online Play"
          description="Find opponents worldwide"
          onPress={() => setMode('online')}
          delay={200}
        />
        <TabHubCard
          icon="🤖"
          title="Play vs Bot"
          description="Practice with AI opponents"
          onPress={() => setMode('bot')}
          delay={300}
        />
        <TabHubCard
          icon="👥"
          title="Play with Friend"
          description="Challenge your friends"
          onPress={() => setMode('friend')}
          delay={400}
        />
      </TabHubScreen>
    );
  }
  // ... rest of component
}

// No StyleSheet needed! ✨
```

**Benefits:**
- ✅ **80% less boilerplate** (150 lines → 30 lines)
- ✅ **100% consistent** (enforces DLS standards)
- ✅ **Type-safe** (TypeScript props validation)
- ✅ **Easy to maintain** (change once, apply everywhere)
- ✅ **Self-documenting** (clear prop names)

### Examples in Codebase

Reference implementations:
- **Play Tab**: `app/(tabs)/index.tsx` - Full pattern with time controls
- **Puzzle Tab**: `app/(tabs)/explore.tsx` - Simple 3-card layout
- **Learn Tab**: `app/(tabs)/learn.tsx` - With stats row

**Component Source:**
- `ui/components/FeatureScreenLayout.tsx` - Container component (theme-aware)
- `ui/components/FeatureCard.tsx` - Card component (theme-aware)
- `ui/components/StatCard.tsx` - Stat card component (theme-aware)

---

## Key Design Principles

1. **Minimal & Elegant**: ShadCN-style neutral palette with strategic accent colors
2. **AI-Aesthetic**: Soft shadows, translucent panels, subtle micro-interactions
3. **Scalable**: Centralized tokens enable global theme updates
4. **Type-Safe**: Full TypeScript support for all components
5. **Mobile-First**: Optimized for touch interactions and screen sizes
6. **Accessible**: Semantic HTML-like structure, readable typography
7. **Performant**: React.forwardRef, memoization, minimal re-renders
8. **Consistent**: Tab Screen Pattern ensures unified UX across all screens

---

## Minimalist Pro Components

### 7. Enhanced Panel Component (Glassmorphism)

```typescript
// app/ui/primitives/Panel.tsx

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeTokens } from '@/ui';

type PanelVariant = 'glass' | 'solid' | 'translucent';

type PanelProps = {
  children: React.ReactNode;
  variant?: PanelVariant;
  padding?: number;
  blur?: boolean;
  style?: ViewStyle;
};

export const Panel: React.FC<PanelProps> = ({
  children,
  variant = 'glass',
  padding = 16,
  blur = true,
  style,
}) => {
  const { colors, isDark } = useThemeTokens();

  // Glass variant with backdrop blur
  if (variant === 'glass' && blur && Platform.OS !== 'web') {
    return (
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.container, style]}
      >
        <View style={{ padding }}>{children}</View>
      </BlurView>
    );
  }

  // Fallback for solid/translucent or web
  return (
    <View style={[styles.container, { padding }, style]}>
      {children}
    </View>
  );
};
```

**Usage:**
```typescript
<Panel variant="glass" padding={20}>
  <Text>Glassmorphic content with backdrop blur</Text>
</Panel>
```

**Variants:**
- `glass`: Glassmorphic with backdrop blur (iOS/Android)
- `solid`: Solid background color
- `translucent`: Semi-transparent without blur

### 8. SegmentedControl Component

```typescript
// app/ui/components/SegmentedControl.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Text } from '@/ui/primitives/Text';
import { useThemeTokens } from '@/ui';

type SegmentedControlProps<T extends string> = {
  segments: T[];
  selectedSegment: T;
  onSegmentChange: (segment: T) => void;
};

export function SegmentedControl<T extends string>({
  segments,
  selectedSegment,
  onSegmentChange,
}: SegmentedControlProps<T>) {
  const { colors, isDark } = useThemeTokens();
  const selectedIndex = segments.indexOf(selectedSegment);
  const segmentWidth = (width - 48) / segments.length;
  
  const translateX = useSharedValue(selectedIndex * segmentWidth);

  React.useEffect(() => {
    translateX.value = withSpring(selectedIndex * segmentWidth, {
      damping: 20,
      stiffness: 200,
    });
  }, [selectedIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <Animated.View style={[styles.indicator, { width: segmentWidth }, indicatorStyle]} />
      {segments.map((segment) => (
        <TouchableOpacity
          key={segment}
          style={[styles.segment, { width: segmentWidth }]}
          onPress={() => onSegmentChange(segment)}
        >
          <Text variant="label" weight={segment === selectedSegment ? 'semibold' : 'medium'}>
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

**Usage:**
```typescript
<SegmentedControl
  segments={['all', 'easy', 'medium', 'hard']}
  selectedSegment={difficulty}
  onSegmentChange={setDifficulty}
/>
```

**Features:**
- iOS-style design with smooth animated indicator
- Spring physics for natural movement
- Theme-aware colors
- Generic type support for type-safe segments

### 9. Enhanced StatCard Component

```typescript
// app/ui/components/StatCard.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/ui/primitives/Text';
import { useThemeTokens } from '@/ui';

type StatCardProps = {
  value: string | number;
  label: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  trend,
  trendValue,
  delay = 0,
}) => {
  const { colors } = useThemeTokens();

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text
        variant="heading"
        weight="bold"
        style={{ fontVariant: ['tabular-nums'], color: colors.foreground.primary }}
      >
        {value}
      </Text>
      <Text variant="caption" style={{ color: colors.foreground.secondary }}>
        {label}
      </Text>
      {trend && trendValue && (
        <View style={styles.trend}>
          <Text style={{ fontSize: 12, fontWeight: '600' }}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};
```

**Usage:**
```typescript
<HStack gap={3}>
  <StatCard value="147" label="Solved" />
  <StatCard value="1450" label="Rating" trend="up" trendValue="+25" />
  <StatCard value="🔥 7" label="Streak" />
</HStack>
```

**Features:**
- Monospaced numbers (tabular-nums) for alignment
- Optional icon support
- Trend indicators (up/down/neutral)
- Animated entrance with staggered delays
- Theme-aware styling

### Minimalist Pro Design Pattern

**Example: Puzzle Screen Implementation**

```typescript
export default function PuzzleHubScreen() {
  const { colors } = useThemeTokens();
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [themes, setThemes] = useState<string[]>([]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack style={styles.content} gap={6}>
          {/* Header with elegant typography */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <Text style={[styles.title, { color: colors.accent.primary }]}>Puzzles</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
              Sharpen your tactical skills
            </Text>
          </Animated.View>

          {/* Glassmorphic Stats Panel */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Panel variant="glass" padding={20}>
              <VStack gap={4}>
                <Text style={styles.sectionTitle}>Your Progress</Text>
                <HStack gap={3}>
                  <StatCard value="147" label="Solved" />
                  <StatCard value="1450" label="Rating" />
                </HStack>
                <HStack gap={3}>
                  <StatCard value="🔥 7" label="Streak" />
                  <StatCard value="89%" label="Success" />
                </HStack>
              </VStack>
            </Panel>
          </Animated.View>

          {/* Daily Puzzle Hero Card */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Pressable onPress={() => router.push('/puzzle/daily')}>
              <Panel variant="glass" padding={24}>
                <VStack gap={3} style={{ alignItems: 'center' }}>
                  <View style={styles.dailyBadge}>
                    <Text style={styles.dailyIcon}>⭐</Text>
                  </View>
                  <Text style={styles.dailyTitle}>Daily Puzzle</Text>
                  <Text style={styles.dailySubtitle}>Rating: 1520</Text>
                  <View style={styles.playButton}>
                    <Text style={styles.playButtonText}>Play Now →</Text>
                  </View>
                </VStack>
              </Panel>
            </Pressable>
          </Animated.View>

          {/* Segmented Control for Difficulty */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <VStack gap={3}>
              <Text style={styles.sectionTitle}>Difficulty</Text>
              <SegmentedControl
                segments={['all', 'easy', 'medium', 'hard']}
                selectedSegment={difficulty}
                onSegmentChange={setDifficulty}
              />
            </VStack>
          </Animated.View>

          {/* Theme Tags (horizontal scroll) */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <VStack gap={3}>
              <Text style={styles.sectionTitle}>Themes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {themeOptions.map((theme) => (
                  <Pressable
                    key={theme.id}
                    style={[
                      styles.themeChip,
                      { backgroundColor: themes.includes(theme.id) ? colors.accent.primary : colors.background.secondary }
                    ]}
                    onPress={() => toggleTheme(theme.id)}
                  >
                    <Text style={styles.themeIcon}>{theme.icon}</Text>
                    <Text style={styles.themeLabel}>{theme.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </VStack>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <VStack gap={3}>
              <Pressable style={styles.primaryButton} onPress={startPuzzle}>
                <Text style={styles.primaryButtonText}>🎲 Start Training</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={viewHistory}>
                <Text style={styles.secondaryButtonText}>📊 View History</Text>
              </Pressable>
            </VStack>
          </Animated.View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Key Minimalist Pro Principles:**
1. ✅ **Glassmorphism**: Translucent panels with backdrop blur
2. ✅ **Elegant Typography**: Proper font weights, letter-spacing, line-heights
3. ✅ **Soft Shadows**: Subtle depth without harsh borders
4. ✅ **Smooth Animations**: Spring physics and staggered entrances
5. ✅ **Monospaced Numbers**: Tabular figures for stat alignment
6. ✅ **Premium Spacing**: Generous padding and proper whitespace
7. ✅ **Theme Awareness**: Adapts to light/dark mode seamlessly
8. ✅ **Subtle Interactions**: Gentle hover states and pressed effects

---

## Future Enhancements

- Animation presets (fade, slide, scale)
- Responsive breakpoints for larger screens
- Gesture support (swipe, pan) for interactive components
- Dark mode refinement
- Custom theme creation API
- Component composition patterns
- Glassmorphism presets for different surfaces
- Advanced segmented control with icons
- Accessibility improvements (A11y labels, focus management)
- Performance monitoring hooks

