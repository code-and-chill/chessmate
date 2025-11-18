# CHESSMATE DESIGN LANGUAGE SYSTEM (DLS)
## Complete React Native (Expo) UI Framework

> **Status**: Implementation Guide  
> **Created**: November 18, 2025  
> **Style**: ShadCN-Inspired, AI-Aesthetic, Mobile-Optimized

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Primitive Components](#primitive-components)
3. [Chess-Specific Components](#chess-specific-components)
4. [Theme System](#theme-system)
5. [Implementation Guide](#implementation-guide)
6. [Usage Examples](#usage-examples)

---

## Design Tokens

### 1. Color Tokens

```typescript
// app/ui/tokens/colors.ts

export type ColorToken = {
  light: string;
  dark: string;
};

export const colorTokens = {
  neutral: {
    50: { light: '#FAFAFA', dark: '#0A0A0A' },
    100: { light: '#F3F3F3', dark: '#161616' },
    200: { light: '#E8E8E8', dark: '#262626' },
    300: { light: '#D4D4D4', dark: '#404040' },
    400: { light: '#A1A1A1', dark: '#7C7C7C' },
    500: { light: '#737373', dark: '#A3A3A3' },
    600: { light: '#525252', dark: '#D4D4D4' },
    700: { light: '#404040', dark: '#E4E4E7' },
    800: { light: '#262626', dark: '#F4F4F5' },
    900: { light: '#171717', dark: '#FAFAFA' },
  },
  blue: {
    50: { light: '#F0F9FF', dark: '#0C1929' },
    100: { light: '#E1F4FE', dark: '#132748' },
    200: { light: '#B3E5FC', dark: '#1E5A8E' },
    300: { light: '#81D4FA', dark: '#2896D3' },
    400: { light: '#4FC3F7', dark: '#3A82F7' },
    500: { light: '#29B6F6', dark: '#60A5FA' },
    600: { light: '#03A9F4', dark: '#3B82F6' },
    700: { light: '#0288D1', dark: '#1D4ED8' },
    800: { light: '#0277BD', dark: '#1E40AF' },
    900: { light: '#01579B', dark: '#1E3A8A' },
  },
  purple: {
    50: { light: '#F5F3FF', dark: '#2D1B4E' },
    100: { light: '#EDE9FE', dark: '#3D1F5C' },
    200: { light: '#DDD6FE', dark: '#5E2FB5' },
    300: { light: '#C4B5FD', dark: '#7C3AED' },
    400: { light: '#A78BFA', dark: '#8B5CF6' },
    500: { light: '#8B5CF6', dark: '#A78BFA' },
    600: { light: '#7C3AED', dark: '#9333EA' },
    700: { light: '#6D28D9', dark: '#7E22CE' },
    800: { light: '#5B21B6', dark: '#6B21A8' },
    900: { light: '#3F0F5C', dark: '#4C0519' },
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

export const typographyTokens = {
  fontFamily: {
    primary: 'Inter',
    mono: 'Monaco',
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

export const spacingTokens = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 12,
  6: 16,
  7: 24,
  8: 32,
  9: 40,
  10: 48,
  12: 64,
  14: 80,
  16: 96,
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

export const radiusTokens = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
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

## Key Design Principles

1. **Minimal & Elegant**: ShadCN-style neutral palette with strategic accent colors
2. **AI-Aesthetic**: Soft shadows, translucent panels, subtle micro-interactions
3. **Scalable**: Centralized tokens enable global theme updates
4. **Type-Safe**: Full TypeScript support for all components
5. **Mobile-First**: Optimized for touch interactions and screen sizes
6. **Accessible**: Semantic HTML-like structure, readable typography
7. **Performant**: React.forwardRef, memoization, minimal re-renders

---

## Future Enhancements

- Animation presets (fade, slide, scale)
- Responsive breakpoints for larger screens
- Gesture support (swipe, pan) for interactive components
- Dark mode refinement
- Custom theme creation API
- Component composition patterns
- Accessibility improvements (A11y labels, focus management)
- Performance monitoring hooks

