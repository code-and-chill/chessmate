/**
 * Panel Primitive Component (Glassmorphic/Minimalist Pro)
 * app/ui/primitives/Panel.tsx
 * 
 * Enhanced with backdrop blur effect for glassmorphism
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

type PanelVariant = 'glass' | 'solid' | 'translucent';
type PanelDensity = 'light' | 'medium' | 'dark';

type PanelProps = {
  children: React.ReactNode;
  variant?: PanelVariant;
  density?: PanelDensity;
  padding?: number;
  blur?: boolean;
  style?: ViewStyle;
};

export const Panel: React.FC<PanelProps> = ({
  children,
  variant = 'glass',
  density = 'medium',
  padding = 16,
  blur = true,
  style,
}) => {
  const { colors, isDark } = useThemeTokens();

  const getBackgroundColor = () => {
    if (variant === 'solid') {
      return colors.background.secondary;
    }
    if (variant === 'translucent') {
      return isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)';
    }
    // Glass variant
    return isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.7)';
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
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.container,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
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
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
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
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    // Padding applied dynamically
  },
});

Panel.displayName = 'Panel';
