/**
 * Skeleton Component - Shadcn-style
 * 
 * A loading placeholder component with shimmer effect
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { radiusTokens } from '@/ui/tokens/radii';
import { cn } from '@/ui/utils/cn';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  className?: string;
  style?: any;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  className,
  style,
  variant = 'rectangular',
}) => {
  const colors = useColors();
  const shimmer = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const borderRadius = variant === 'circular' ? radiusTokens.full : radiusTokens.md;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.background.secondary,
          opacity,
        },
        style,
      ]}
      className={cn(className)}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

Skeleton.displayName = 'Skeleton';
