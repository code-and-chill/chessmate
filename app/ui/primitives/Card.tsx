/**
 * Card Primitive Component
 * app/ui/primitives/Card.tsx
 * 
 * Supports both DLS props (variant, size, padding) and Tailwind className.
 * DLS props take precedence over Tailwind classes for design values.
 * Tailwind classes are useful for layout utilities.
 */

import type React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColors, useIsDark } from '@/ui/hooks/useThemeTokens';
import { getElevation, getElevationBlur } from '@/ui/tokens/elevation';
import { radiusTokens } from '@/ui/tokens/radii';
import { shadowTokens } from '@/ui/tokens/shadows';
import { cn } from '../utils/cn';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'gradient' | 'outline' | 'surfaceElevated' | 'surfaceFloating' | 'surfaceModal' | 'glow';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

export type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  padding?: number;
  shadow?: 'card' | 'panel' | 'floating';
  borderColor?: string;
  borderWidth?: number;
  gradient?: string[];
  hoverable?: boolean;
  pressable?: boolean;
  animated?: boolean;
  className?: string;
  style?: ViewStyle;
};

const sizeConfig = {
  sm: { padding: 12, radius: 12 }, // More rounded like Claude
  md: { padding: 16, radius: 12 },
  lg: { padding: 20, radius: 12 }, // Consistent rounded corners
  xl: { padding: 24, radius: 12 },
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  padding,
  gradient,
  pressable = false,
  animated = false,
  className,
  style,
}) => {
  const colors = useColors();
  const isDark = useIsDark();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), []);

  const handlePressIn = () => {
    if (pressable && animated) {
      scale.value = withSpring(0.97, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const handlePressOut = () => {
    if (pressable && animated) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const { padding: sizePadding, radius } = sizeConfig[size];
  const finalPadding = padding ?? sizePadding;
  // Elevation-based variants using new elevation tokens
  const getElevationStyle = (level: 'surface8' | 'surface16' | 'surface24') => {
    const elevation = getElevation(level);
    return {
      backgroundColor: colors.background.secondary,
      ...Platform.select({
        ios: elevation.shadow,
        android: { elevation: elevation.zIndex },
      }),
    };
  };

  const variantStyles = {
    default: { 
      ...styles.default, 
      backgroundColor: colors.background.card, 
      ...shadowTokens.card,
      borderWidth: 0, // No borders like Claude
    },
    elevated: { 
      ...styles.elevated, 
      backgroundColor: colors.background.card, // White cards
      ...shadowTokens.card, // Soft shadow
      borderWidth: 0,
    },
    glass: {
      ...styles.glass,
      backgroundColor: colors.background.card,
      borderWidth: 0, // No borders
      ...shadowTokens.card,
    },
    gradient: { ...styles.gradient, ...shadowTokens.hover, borderWidth: 0 },
    outline: { ...styles.outline, borderColor: colors.border },
    glow: { ...styles.elevated, backgroundColor: colors.background.card, ...shadowTokens.card, borderWidth: 0 },
    surfaceElevated: { ...getElevationStyle('surface8'), borderWidth: 0 },
    surfaceFloating: { ...getElevationStyle('surface16'), borderWidth: 0 },
    surfaceModal: { ...getElevationStyle('surface24'), borderWidth: 0 },
  };
  
  const CardWrapper = animated ? Animated.View : View;
  
  // Use BlurView for glass and elevated surface variants
  const useBlur = (variant === 'glass' || variant === 'surfaceElevated' || variant === 'surfaceFloating' || variant === 'surfaceModal' || variant === 'glow') && Platform.OS !== 'web';

  const blurIntensity = variant === 'glass' ? (isDark ? 40 : 60) :
                        variant === 'surfaceElevated' ? getElevationBlur('surface8') :
                        variant === 'surfaceFloating' ? getElevationBlur('surface16') :
                        variant === 'surfaceModal' ? getElevationBlur('surface24') :
                        variant === 'glow' ? 20 : 0;

  const cardStyle = [
    styles.card,
    variantStyles[variant],
    { borderRadius: radius, padding: finalPadding },
    animated && animatedStyle,
    style,
  ];

  if (useBlur) {
    return (
      <CardWrapper
        className={cn(className)}
        style={[cardStyle, { overflow: 'hidden' }]}
        onTouchStart={animated ? handlePressIn : undefined}
        onTouchEnd={animated ? handlePressOut : undefined}
      >
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {gradient && gradient.length > 0 && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: radius,
                backgroundColor: gradient[0],
                opacity: 0.8,
              },
            ]}
          />
        )}
        <View style={styles.content}>{children}</View>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      className={cn(className)}
      style={cardStyle}
      onTouchStart={animated ? handlePressIn : undefined}
      onTouchEnd={animated ? handlePressOut : undefined}
    >
      {gradient && gradient.length > 0 && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              backgroundColor: gradient[0],
            },
          ]}
        />
      )}
      <View style={styles.content}>{children}</View>
    </CardWrapper>
  );
};

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  default: {
    // backgroundColor set dynamically from theme
  },
  elevated: {
    // backgroundColor set dynamically from theme
  },
  glass: {
    borderWidth: 1,
  },
  gradient: {
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    // borderColor set dynamically from theme
  },
});
