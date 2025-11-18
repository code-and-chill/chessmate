/**
 * Enhanced Card Component with AI-Inspired Design
 * Features: gradients, glass morphism, depth, smooth transitions
 */

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'gradient' | 'outline';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

export interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  gradient?: string[];
  hoverable?: boolean;
  pressable?: boolean;
  style?: ViewStyle;
}

const sizeConfig = {
  sm: { padding: 12, radius: 12 },
  md: { padding: 16, radius: 16 },
  lg: { padding: 24, radius: 20 },
  xl: { padding: 32, radius: 24 },
};

/**
 * EnhancedCard Component
 * 
 * Modern card with depth, gradients, and smooth interactions
 */
export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  gradient,
  hoverable = false,
  pressable = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), []);

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.97, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const { padding, radius } = sizeConfig[size];

  const variantStyles = {
    default: styles.default,
    elevated: styles.elevated,
    glass: styles.glass,
    gradient: styles.gradient,
    outline: styles.outline,
  };

  return (
    <Animated.View
      style={[
        styles.card,
        variantStyles[variant],
        {
          padding,
          borderRadius: radius,
        },
        animatedStyle,
        style,
      ].filter(Boolean)}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      {gradient && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              backgroundColor: gradient && gradient.length > 0 ? gradient[0].replace(/^#/, '').length === 6 ? gradient[0] : '#667EEA' : '#667EEA',
            },
          ]}
        />
      )}
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

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
