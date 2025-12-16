/**
 * Panel Primitive Component
 * app/ui/primitives/Panel.tsx
 * 
 * Supports both DLS props (variant, density, padding) and Tailwind className.
 * DLS props take precedence over Tailwind classes for design values.
 * Tailwind classes are useful for layout utilities.
 */

import React from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { shadowTokens } from '@/ui/tokens/shadows';
import { radiusTokens } from '@/ui/tokens/radii';
import { cn } from '../utils/cn';

type PanelVariant = 'glass' | 'solid' | 'translucent';
type PanelDensity = 'light' | 'medium' | 'dark';

type PanelProps = {
  children: React.ReactNode;
  variant?: PanelVariant;
  density?: PanelDensity;
  padding?: number;
  blur?: boolean;
  className?: string;
  // Accept single style or array so callers can pass conditional styles
  style?: StyleProp<ViewStyle>;
};

export const Panel: React.FC<PanelProps> = ({
  children,
  variant = 'glass',
  density = 'medium',
  padding = 16,
  blur = true,
  className,
  style,
}) => {
  const { colors, isDark } = useThemeTokens();

  const getBackgroundColor = () => {
    if (variant === 'solid') {
      return colors.background.secondary;
    }
    if (variant === 'translucent') {
      return density === 'dark' ? colors.translucent.dark : density === 'light' ? colors.translucent.light : colors.translucent.medium;
    }
    // Glass variant
    return density === 'dark' ? colors.translucent.dark : density === 'light' ? colors.translucent.light : colors.translucent.medium;
  };

  const content = (
    <View style={[styles.content, { padding }]}>
      {children}
    </View>
  );

  // Use BlurView for glass effect on iOS/Android
  if (variant === 'glass' && blur && Platform.OS !== 'web') {
    return (
      <BlurView
        className={cn(className)}
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.container,
          shadowTokens.panel,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: colors.border,
          },
          style,
        ]}
      >
        {content}
      </BlurView>
    );
  }

  // Fallback for web or non-blur variants
  return (
    <View
      className={cn(className)}
      style={[
        styles.container,
        shadowTokens.panel,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radiusTokens.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    // Padding applied dynamically
  },
});

Panel.displayName = 'Panel';
