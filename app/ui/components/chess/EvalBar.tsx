/**
 * EvalBar Component
 * 
 * Real-time evaluation bar for live games showing position advantage.
 * Features:
 * - White/Black advantage gradient fills
 * - Smooth animated transitions
 * - Centipawn to visual percentage conversion
 * - Mate score indicators
 * - Compact horizontal or vertical layout
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useColors, useIsDark, feedbackColorTokens } from '@/ui';

export type EvalBarProps = {
  /**
   * Position evaluation in centipawns.
   * Positive = white advantage, negative = black advantage.
   * Example: 100 = +1.00 (1 pawn advantage for white)
   */
  evaluation: number;
  
  /**
   * Player's color (determines bar orientation)
   */
  playerColor?: 'white' | 'black';
  
  /**
   * Bar orientation
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Bar dimensions
   */
  width?: number;
  height?: number;
  
  /**
   * Show numeric eval value
   */
  showValue?: boolean;
  
  /**
   * Animate transitions
   */
  animated?: boolean;
};

const MAX_EVAL = 1000; // Cap at ±10 pawns for visual purposes

/**
 * Convert centipawn evaluation to percentage for bar display
 * 0% = max black advantage, 50% = equal, 100% = max white advantage
 */
const evalToPercentage = (evaluation: number): number => {
  const clamped = Math.max(-MAX_EVAL, Math.min(MAX_EVAL, evaluation));
  return ((clamped + MAX_EVAL) / (2 * MAX_EVAL)) * 100;
};

/**
 * Format evaluation for display
 */
const formatEval = (evaluation: number): string => {
  if (Math.abs(evaluation) >= 10000) {
    return evaluation > 0 ? 'M' : '-M'; // Mate
  }
  const pawns = (evaluation / 100).toFixed(1);
  return evaluation > 0 ? `+${pawns}` : pawns;
};

export const EvalBar: React.FC<EvalBarProps> = ({
  evaluation,
  playerColor = 'white',
  orientation = 'vertical',
  width = orientation === 'vertical' ? 32 : 200,
  height = orientation === 'vertical' ? 200 : 32,
  showValue = true,
  animated = true,
}) => {
  const colors = useColors();
  const isDark = useIsDark();
  
  const percentage = useSharedValue(50); // Start at equal position
  const evalValue = useSharedValue(0);
  
  useEffect(() => {
    const targetPercentage = evalToPercentage(evaluation);
    
    if (animated) {
      percentage.value = withSpring(targetPercentage, {
        damping: 20,
        stiffness: 100,
      });
      evalValue.value = withSpring(evaluation, {
        damping: 20,
        stiffness: 100,
      });
    } else {
      percentage.value = targetPercentage;
      evalValue.value = evaluation;
    }
  }, [evaluation, animated, percentage, evalValue]);
  
  const animatedBarStyle = useAnimatedStyle(() => {
    // Get colors from feedback tokens - use the correct properties
    const whiteColor = isDark 
      ? feedbackColorTokens.evaluation.winning.dark 
      : feedbackColorTokens.evaluation.winning.light;
    const blackColor = isDark 
      ? feedbackColorTokens.evaluation.losing.dark 
      : feedbackColorTokens.evaluation.losing.light;
    const equalColor = isDark 
      ? feedbackColorTokens.evaluation.slight.dark 
      : feedbackColorTokens.evaluation.slight.light;
    
    // Ensure we have valid colors (fallback to defaults if needed)
    const safeWhiteColor = whiteColor || (isDark ? '#22C55E' : '#16A34A');
    const safeBlackColor = blackColor || (isDark ? '#111827' : '#1F2937');
    const safeEqualColor = equalColor || (isDark ? '#374151' : '#F3F4F6');
    
    // Clamp percentage value to valid range [0, 100]
    const clampedPercentage = Math.max(0, Math.min(100, percentage.value));
    
    // Interpolate between black, equal, and white
    let backgroundColor: string;
    if (clampedPercentage < 50) {
      // Black advantage (0-50%)
      backgroundColor = interpolateColor(
        clampedPercentage,
        [0, 50],
        [safeBlackColor, safeEqualColor]
      );
    } else if (clampedPercentage > 50) {
      // White advantage (50-100%)
      backgroundColor = interpolateColor(
        clampedPercentage,
        [50, 100],
        [safeEqualColor, safeWhiteColor]
      );
    } else {
      // Exactly 50% - use equal color
      backgroundColor = safeEqualColor;
    }
    
    // Use clamped percentage for dimensions to prevent layout issues
    if (orientation === 'vertical') {
      return {
        height: `${clampedPercentage}%`,
        backgroundColor,
      };
    } else {
      return {
        width: `${clampedPercentage}%`,
        backgroundColor,
      };
    }
  });
  
  const containerStyle = orientation === 'vertical'
    ? { width, height, flexDirection: 'column' as const }
    : { width, height, flexDirection: 'row' as const };
  
  const isVertical = orientation === 'vertical';
  
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.barContainer,
          containerStyle,
          { backgroundColor: isDark ? '#2A2A2A' : '#E5E5E5' },
        ]}
      >
        {/* Black advantage side */}
        <View
          style={[
            styles.section,
            isVertical ? styles.topSection : styles.leftSection,
            { 
              backgroundColor: isDark 
                ? feedbackColorTokens.evaluation.losing.dark + '20' 
                : feedbackColorTokens.evaluation.losing.light + '20' 
            },
          ]}
        />
        
        {/* White advantage animated bar */}
        <Animated.View
          style={[
            styles.animatedBar,
            animatedBarStyle,
            isVertical ? styles.verticalBar : styles.horizontalBar,
          ]}
        />
      </View>
      
      {/* Evaluation value display */}
      {showValue && (
        <View style={[styles.valueContainer, isVertical ? styles.valueVertical : styles.valueHorizontal]}>
          <RNText style={[styles.valueText, { color: colors.foreground.primary }]}>
            {formatEval(evaluation)}
          </RNText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  barContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  section: {
    flex: 1,
  },
  topSection: {
    // Top half for vertical (black advantage)
  },
  leftSection: {
    // Left half for horizontal (black advantage)
  },
  animatedBar: {
    position: 'absolute',
    borderRadius: 8,
  },
  verticalBar: {
    bottom: 0,
    left: 0,
    right: 0,
  },
  horizontalBar: {
    left: 0,
    top: 0,
    bottom: 0,
  },
  valueContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  valueVertical: {
    position: 'absolute',
    top: 8,
    left: '50%',
    transform: [{ translateX: -20 }],
  },
  valueHorizontal: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  valueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
