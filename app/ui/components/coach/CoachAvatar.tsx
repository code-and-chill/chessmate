/**
 * CoachAvatar Component
 * 
 * Illustrated coach character with expression variants for personalized feedback.
 * Features smooth transitions between expressions and customizable appearance.
 * 
 * Usage:
 * ```tsx
 * <CoachAvatar
 *   expression="happy"
 *   size={80}
 *   animated={true}
 * />
 * ```
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { useIsDark, useColors } from '../../hooks/useThemeTokens';
import { feedbackColorTokens } from '../../tokens/feedback';
import { spacingTokens } from '../../tokens/spacing';

export type CoachExpression = 
  | 'happy'        // Positive feedback, encouragement
  | 'thoughtful'   // Analyzing, considering
  | 'surprised'    // Brilliant move, unexpected
  | 'concerned'    // Mistake, warning
  | 'excited'      // Great move, celebration
  | 'neutral';     // Default, calm

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export type CoachAvatarProps = {
  /**
   * Avatar expression
   */
  expression?: CoachExpression;
  
  /**
   * Avatar size
   */
  size?: AvatarSize | number;
  
  /**
   * Show name below avatar
   */
  showName?: boolean;
  
  /**
   * Coach name
   */
  name?: string;
  
  /**
   * Animated transition between expressions
   */
  animated?: boolean;
  
  /**
   * Bounce animation on mount
   */
  bounce?: boolean;
  
  /**
   * Custom background color
   */
  backgroundColor?: string;
  
  /**
   * Border width
   */
  borderWidth?: number;
  
  /**
   * Border color
   */
  borderColor?: string;
};

const sizeMap = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 100,
};

// Expression emoji mappings (deprecated - use SVG icons instead)
const expressionEmojis: Record<CoachExpression, string> = {
  happy: '😊',
  thoughtful: '🤔',
  surprised: '😲',
  concerned: '😟',
  excited: '🤩',
  neutral: '😐',
};

// Expression colors
const expressionColors: Record<CoachExpression, string> = {
  happy: '#10B981',     // Green
  thoughtful: '#8B5CF6', // Purple
  surprised: '#06B6D4',  // Cyan
  concerned: '#F59E0B',  // Amber
  excited: '#EC4899',    // Pink
  neutral: '#6B7280',    // Gray
};

/**
 * CoachAvatar Component
 * 
 * Friendly coach character with animated expressions.
 */
export const CoachAvatar: React.FC<CoachAvatarProps> = ({
  expression = 'neutral',
  size = 'md',
  showName = false,
  name = 'Coach',
  animated = true,
  bounce = false,
  backgroundColor,
  borderWidth = 3,
  borderColor,
}) => {
  const isDark = useIsDark();
  const colors = useColors();
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);
  
  // Get numeric size
  const avatarSize = typeof size === 'number' ? size : sizeMap[size];
  const fontSize = avatarSize * 0.5;
  
  // Expression color
  const accentColor = borderColor || expressionColors[expression];
  const bgColor = backgroundColor || (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)');
  
  // Bounce animation on mount
  useEffect(() => {
    if (bounce) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    }
  }, []);
  
  // Expression change animation
  useEffect(() => {
    if (animated) {
      // Subtle pulse when expression changes
      scale.value = withSequence(
        withSpring(1.1, { damping: 15, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      
      // Slight rotation wiggle
      rotate.value = withSequence(
        withTiming(5, { duration: 100, easing: Easing.ease }),
        withTiming(-5, { duration: 100, easing: Easing.ease }),
        withTiming(0, { duration: 100, easing: Easing.ease })
      );
    }
  }, [expression]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));
  
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor: bgColor,
            borderWidth,
            borderColor: accentColor,
          },
          animated && animatedStyle,
        ]}
      >
        <RNText style={[styles.emoji, { fontSize }]}>
          {expressionEmojis[expression]}
        </RNText>
      </Animated.View>
      
      {showName && (
        <RNText style={[styles.name, { color: colors.foreground.secondary }]}>
          {name}
        </RNText>
      )}
    </View>
  );
};

/**
 * Hook to cycle through expressions for demo/testing
 */
export const useExpressionCycle = (interval: number = 2000): CoachExpression => {
  const expressions: CoachExpression[] = ['neutral', 'thoughtful', 'happy', 'excited', 'surprised', 'concerned'];
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % expressions.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval]);
  
  return expressions[currentIndex];
};

/**
 * Hook to map sentiment to expression
 */
export const useExpressionForSentiment = (sentiment: 'positive' | 'neutral' | 'cautionary' | 'critical'): CoachExpression => {
  const expressionMap = {
    positive: 'happy',
    neutral: 'thoughtful',
    cautionary: 'concerned',
    critical: 'concerned',
  } as const;
  
  return expressionMap[sentiment];
};

/**
 * Hook to map move quality to expression
 */
export const useExpressionForMoveQuality = (quality: string): CoachExpression => {
  const expressionMap: Record<string, CoachExpression> = {
    brilliant: 'excited',
    best: 'happy',
    great: 'happy',
    good: 'happy',
    book: 'thoughtful',
    inaccuracy: 'thoughtful',
    mistake: 'concerned',
    blunder: 'concerned',
    miss: 'surprised',
  };
  
  return expressionMap[quality] || 'neutral';
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacingTokens[2],
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emoji: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false, // Android: removes extra padding for better alignment
    lineHeight: undefined, // Let fontSize determine line height
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
