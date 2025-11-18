/**
 * Card Primitive Component
 * app/ui/primitives/Card.tsx
 * 
 * Enhanced with animations, variants, and modern interactions
 */

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'gradient' | 'outline';
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
  style?: ViewStyle;
};

const sizeConfig = {
  sm: { padding: 12, radius: 12 },
  md: { padding: 16, radius: 16 },
  lg: { padding: 24, radius: 20 },
  xl: { padding: 32, radius: 24 },
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  padding,
  shadow,
  borderColor,
  borderWidth,
  gradient,
  hoverable = false,
  pressable = false,
  animated = false,
  style,
}) => {
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

  const variantStyles = {
    default: styles.default,
    elevated: styles.elevated,
    glass: styles.glass,
    gradient: styles.gradient,
    outline: styles.outline,
  };

  const cardStyle = [
    styles.card,
    variantStyles[variant],
    {
      padding: finalPadding,
      borderRadius: radius,
    },
    borderColor && { borderColor },
    borderWidth !== undefined && { borderWidth },
    animated && animatedStyle,
    style,
  ].filter(Boolean);

  const CardWrapper = animated ? Animated.View : View;

  return (
    <CardWrapper
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
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gradient: {
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
});
